# 10. Стратегия тестирования (CQRS & Handlers)

В нашей архитектуре основной упор делается на тестирование Command и Query Handlers в изоляции от HTTP-слоя. Это позволяет проверять бизнес-логику без запуска веб-сервера.

## 1. Типы тестов для Handlers

### 1.1. Интеграционные тесты (Рекомендуемо)

Мы проверяем работу хендлера вместе с шиной (`CommandBus`/`QueryBus`) и реальной (или тестовой) базой данных.

- **Где:** `apps/api/src/app/<module>/<type>/<name>/<name>.handler.spec.ts`
- **Инструмент:** `NestJS Testing Module`.

### 1.2. Юнит-тесты (Для сложной логики)

Если хендлер содержит много условий, мы мокаем (mock) зависимости (например, репозиторий) и проверяем только логику метода `execute`.

## 2. Шаблон теста для Command Handler

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule, CommandBus } from '@nestjs/cqrs';
import { CreateAnimalHandler } from './create-animal.handler';
import { CreateAnimalCommand } from './create-animal.command';
import { DatabaseModule } from '@pif/database';

describe('CreateAnimalHandler', () => {
	let commandBus: CommandBus;
	let module: TestingModule;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [CqrsModule, DatabaseModule],
			providers: [CreateAnimalHandler]
		}).compile();

		await module.init();
		commandBus = module.get<CommandBus>(CommandBus);
	});

	afterAll(async () => {
		await module.close();
	});

	it('должен успешно создать животное', async () => {
		const command = new CreateAnimalCommand({
			name: 'Рекс',
			species: 'DOG',
			gender: 'MALE',
			birthDate: new Date(),
			size: 'MEDIUM',
			coat: 'SHORT',
			color: 'Brown'
		});

		// Вызываем через шину, как это делает контроллер
		const result = await commandBus.execute(command);

		expect(result).toBeDefined();
		expect(typeof result).toBe('string'); // Ожидаем UUID
	});
});
```

## 3. Запуск тестов

- Все тесты: `nx test api`
- Конкретный файл: `nx test api --testFile=apps/api/src/app/animals/commands/create-animal/create-animal.handler.spec.ts`

## 4. Почему это лучше контроллеров?

1.  **Скорость:** Тесты запускаются быстрее, чем `npm run start`.
2.  **Атомарность:** Вы проверяете ровно одну функцию системы.
3.  **Документация:** Тест наглядно показывает, какие данные нужны хендлеру и что он возвращает.
4.  **Регрессия:** При изменении схемы БД тесты упадут первыми, подсказав, где сломалась логика.
