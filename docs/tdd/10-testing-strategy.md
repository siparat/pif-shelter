# 10. Стратегия тестирования (CQRS & Handlers)

В нашей архитектуре основной упор делается на тестирование Command и Query Handlers в изоляции от HTTP-слоя. Это позволяет проверять бизнес-логику без запуска веб-сервера.

## 1. Типы тестов для Handlers

### 1.1. Интеграционные тесты (Рекомендуемо)

Мы проверяем работу хендлера вместе с шиной (`CommandBus`/`QueryBus`) и реальной (или тестовой) базой данных.

- **Где:** `apps/api/src/app/<module>/<type>/<name>/<name>.handler.spec.ts`
- **Инструмент:** `NestJS Testing Module`.

### 1.2. Юнит-тесты (Для сложной логики)

Если хендлер содержит много условий, мы мокаем (mock) зависимости (например, репозиторий) и проверяем только логику метода `execute`.

## 2. Шаблон теста для Command Handler (Unit Test)

Для моков мы используем библиотеку `@golevelup/ts-jest`.
Она позволяет создавать типизированные моки без boilerplate-кода.

```typescript
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { CreateAnimalHandler } from './create-animal.handler';
import { CreateAnimalCommand } from './create-animal.command';
import { IAnimalsRepository } from '../../repositories/animals.repository.interface';

describe('CreateAnimalHandler', () => {
	let handler: CreateAnimalHandler;
	let repository: DeepMocked<IAnimalsRepository>;
	let eventBus: DeepMocked<EventBus>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateAnimalHandler,
				{
					provide: IAnimalsRepository,
					useValue: createMock<IAnimalsRepository>()
				},
				{
					provide: EventBus,
					useValue: createMock<EventBus>()
				}
			]
		}).compile();

		handler = module.get<CreateAnimalHandler>(CreateAnimalHandler);
		repository = module.get(IAnimalsRepository);
		eventBus = module.get(EventBus);
	});

	it('должен успешно создать животное', async () => {
		const command = new CreateAnimalCommand({
			name: 'Рекс'
			// ... остальные поля
		} as any);

		const expectedId = 'uuid-123';
		repository.create.mockResolvedValue(expectedId);

		const result = await handler.execute(command);

		expect(repository.create).toHaveBeenCalledWith(command.dto);
		expect(eventBus.publish).toHaveBeenCalled();
		expect(result).toBe(expectedId);
	});
});
```

## 3. Интеграционные и E2E тесты с Testcontainers

Для тестов, требующих реальную базу данных (например, сложные SQL-запросы в репозиториях или полные E2E сценарии), мы используем `Testcontainers`.
Это позволяет запускать чистый экземпляр PostgreSQL в Docker для каждого прогона тестов.

Пример настройки:
Мы используем `@testcontainers/postgresql` для поднятия контейнера и накатываем миграции Drizzle перед тестами.

```typescript
// Пример setup (будет вынесен в shared test utils)
import { PostgreSqlContainer } from '@testcontainers/postgresql';

const container = await new PostgreSqlContainer().start();
const connectionString = container.getConnectionUri();
// ... инициализация Drizzle с connectionString
```

## 3. Запуск тестов

- Все тесты: `nx test api`
- Конкретный файл: `nx test api --testFile=apps/api/src/app/animals/commands/create-animal/create-animal.handler.spec.ts`

## 4. Почему это лучше контроллеров?

1.  **Скорость:** Тесты запускаются быстрее, чем `npm run start`.
2.  **Атомарность:** Вы проверяете ровно одну функцию системы.
3.  **Документация:** Тест наглядно показывает, какие данные нужны хендлеру и что он возвращает.
4.  **Регрессия:** При изменении схемы БД тесты упадут первыми, подсказав, где сломалась логика.
