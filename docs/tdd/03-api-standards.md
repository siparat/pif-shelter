# 03. API Standards & Data Contracts

Документ описывает правила взаимодействия между клиентом (Frontend) и сервером (API).

## 1. Конвенции HTTP

### 1.1. Методы

Мы используем RESTful подход.

- GET — получение данных. Идемпотентный метод.
- POST — создание ресурса или выполнение RPC-команды.
- PATCH — частичное обновление ресурса.
- DELETE — удаление.

### 1.2. Статусы ответов

- 200 OK — Успех (GET, PATCH, RPC).
- 201 Created — Ресурс создан (POST).
- 204 No Content — Успешно, тело пустое.
- 400 Bad Request — Ошибка валидации (Zod).
- 401 Unauthorized — Нет авторизации.
- 403 Forbidden — Нет прав (Roles).
- 404 Not Found — Не найдено.
- 409 Conflict — Конфликт (нарушение уникальности, бизнес-правила).
- 422 Unprocessable Entity — Логическая ошибка валидации.
- 500 Internal Server Error — Баг сервера.

## 2. Формат Ответа (Response Envelope)

Мы всегда оборачиваем ответ в единую структуру с помощью Global Interceptor.

### 2.1. Успешный ответ (Success)

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8
  }
}
```

### 2.2. Ответ с ошибкой (Error)

```json
{
	"success": false,
	"error": {
		"code": "UserAlreadyExists",
		"message": "Пользователь с таким email уже существует",
		"details": [
			// Опционально: ошибки полей формы (zod)
			{
				"field": "email",
				"message": "Invalid email format"
			}
		]
	}
}
```

## 3. Обработка Ошибок (Error Handling)

### 3.1. Zod Validation (Pipe -> Filter)

Мы используем `nestjs-zod` или кастомный пайп.

1. Pipe валидирует DTO. При ошибке выбрасывает `UnprocessableEntityException` с сырыми данными Zod.
2. Global Exception Filter ловит ошибку, парсит Zod issues и формирует красивый массив `details` в ответе.

### 3.2. Business Exceptions (Semantic Classes)

Для каждой бизнес-ошибки мы создаем отдельный класс исключения, наследуясь от встроенных HTTP-ошибок NestJS. Это позволяет генерировать правильные статус-коды автоматически.

Примеры:

```ts
export class AnimalHasGuardianException extends ConflictException {
	constructor() {
		super('This animal already has a guardian');
	}
}

export class AnimalNotFoundException extends NotFoundException {
	constructor(id: string) {
		super(`Animal with ID ${id} not found`);
	}
}
```

## 4. Пагинация, Сортировка, Поиск

Для списков используем следующие Query Parameters:

- q: string — Строка полнотекстового поиска (search).
- page: number (default: 1) — Номер страницы.
- per_page: number (default: 20) — Кол-во элементов.
- sort: string — Формат `field:direction`.
    - Пример: `createdAt:desc` (сначала новые).
    - Пример: `price:asc` (от дешевых к дорогим).
- filters — Формат (birth_date[gte]=2020-01-01&status=PUBLISHED).

Пример запроса:
GET /animals?page=2&per_page=10&sort=age:asc&q=рыжий&birth_date[gte]=2025-01-01

## 5. Документация (Swagger)

Используем декораторы `@nestjs/swagger`.

- DTO классы размечаем через `@ApiProperty()`.
- Контроллеры размечаем через `@ApiResponse({ type: ... })`.
- Ошибки описываем явно: `@ApiResponse({ status: 409, description: 'Animal already has guardian' })`.
