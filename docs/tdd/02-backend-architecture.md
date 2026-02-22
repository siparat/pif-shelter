# 02. Архитектура Backend (NestJS + CQRS)

Мы строим приложение по принципам **Modular Monolith**. Весь серверный код находится в директории apps/api.
Вместо классических "толстых" сервисов мы используем **CQRS** (Command Query Responsibility Segregation). Это значит, что каждая бизнес-операция (создать, найти, обновить) выносится в отдельный класс-хендлер.

## 1. Структура Папок

Все функциональные модули располагаются внутри apps/api/src/app/.
Мы отказываемся от единого `AnimalsService` в пользу разделения ответственности.

Пример структуры модуля animals:

```text
apps/api/src/app/animals/
├── commands/                   # Операции изменения данных (Write)
│   ├── create-animal/          # Группировка по фиче
│   │   ├── create-animal.command.ts
│   │   └── create-animal.handler.ts
│   └── update-status/
│       ├── update-status.command.ts
│       └── update-status.handler.ts
│
├── queries/                    # Операции чтения данных (Read)
│   ├── get-animal-by-id/
│   │   ├── get-animal-by-id.query.ts
│   │   └── get-animal-by-id.handler.ts
│   └── search-animals/
│       ├── search-animals.query.ts
│       └── search-animals.handler.ts
│
├── events/                     # События домена (Async)
│   ├── animal-created.event.ts
│   └── animal-adopted.event.ts
│
├── animals.controller.ts       # Входная точка (HTTP)
└── animals.module.ts           # Сборка модуля (Providers)
```

## 2. Реализация Компонентов

### 2.1. Controller (Тонкий контроллер)

Контроллер не содержит бизнес-логики. Он только валидирует входные данные (через DTO) и дирижирует шинами команд/запросов.
Вместо инъекции Сервиса, мы инжектим CommandBus и QueryBus.

Пример кода контроллера:

```ts
@Controller('animals')
export class AnimalsController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus
	) {}

	@Post()
	async create(@Body() dto: CreateAnimalDto) {
		return this.commandBus.execute(new CreateAnimalCommand(dto.name, dto.age, dto.breed));
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.queryBus.execute(new GetAnimalByIdQuery(id));
	}
}
```

### 2.2. Commands (Write Side)

Команды меняют состояние системы.
Command: Простой DTO-класс, несущий данные.
Handler: Класс с логикой. Выполняет запись в БД через Drizzle.

Пример Command и Handler:

```ts
// create-animal.command.ts
import { Command } from '@nestjs/cqrs';

// Команда - это простой DTO-класс, который может наследоваться от базового класса Command<T>,
// где T - тип возвращаемого значения для хендлера.
export class CreateAnimalCommand extends Command<{ id: string }> {
	constructor(
		public readonly name: string,
		public readonly age: number,
		public readonly breed: string
	) {
		super();
	}
}

// create-animal.handler.ts
@CommandHandler(CreateAnimalCommand)
export class CreateAnimalHandler implements ICommandHandler<CreateAnimalCommand> {
	constructor(
		private readonly db: DrizzleService,
		private readonly eventBus: EventBus
	) {}

	async execute(command: CreateAnimalCommand): Promise<{ id: string }> {
		const { name, age, breed } = command;

		const [newAnimal] = await this.db.insert(animals).values({ name, age, breed }).returning({ id: animals.id });

		this.eventBus.publish(new AnimalCreatedEvent(newAnimal.id));

		return { id: newAnimal.id };
	}
}
```

### 2.3. Queries (Read Side)

Запросы только читают данные.
Handler: Может делать сложные JOIN и возвращать данные, подготовленные специально для фронтенда (ViewModel). Валидация здесь минимальна.

Пример Handler для Query:

```ts
// get-animal-by-id.handler.ts
@QueryHandler(GetAnimalByIdQuery)
export class GetAnimalByIdHandler implements IQueryHandler<GetAnimalByIdQuery> {
	constructor(private readonly db: DrizzleService) {}

	async execute(query: GetAnimalByIdQuery): Promise<AnimalDto | null> {
		const result = await this.db.select().from(animals).where(eq(animals.id, query.id)).limit(1);

		return result[0] || null;
	}
}
```

## 3. Регистрация в Модуле

Так как у нас нет одного большого сервиса, нам нужно регистрировать каждый хендлер в массиве providers явно.

```ts
@Module({
	controllers: [AnimalsController],
	providers: [CreateAnimalHandler, UpdateStatusHandler, GetAnimalByIdHandler, SearchAnimalsHandler]
})
export class AnimalsModule {}
```

## 4. База данных и Схемы

Схемы таблиц (Drizzle) хранятся централизованно в библиотеке `libs/database/src/lib/schemas/` (см. документ 04. Database Rules).

Каждый файл схемы экспортирует объекты `schema` и `relations`, которые автоматически подтягиваются в `DatabaseService`. Это обеспечивает доступ к типизированным запросам и реляционному синтаксису (`db.query.*`) во всех модулях приложения.

## 5. Важные правила

1. Изоляция: Хендлер одного модуля не должен напрямую вызывать хендлер другого. Используйте события (EventBus) или публичный API (CommandBus c экспортируемыми командами).
2. Межмодульное взаимодействие: Если модулю необходим доступ к данным другого модуля (например, проверить существование пользователя), это взаимодействие происходит ТОЛЬКО через **Service** вызываемого модуля. Прямой импорт **Repository** другого модуля ЗАПРЕЩЕН (см. ADR-003).
3. Валидация: Вся бизнес-валидация (например, "нельзя пристроить животное, которое болеет") происходит внутри CommandHandler или Policy. DTO валидирует только формат данных.
4. Events: Используем папку events для классов событий. События триггерятся ПОСЛЕ успешного выполнения команд (для отправки уведомлений, обновления кэша, логов).
