# 04. Database Design & Drizzle ORM Guidelines

Документ описывает стандарты проектирования базы данных PostgreSQL и правила использования Drizzle ORM.

## 1. Общие принципы

### 1.1. Стек

- Database: PostgreSQL (Latest stable).
- ORM: Drizzle ORM.
- Migration Tool: Drizzle Kit.

### 1.2. Организация схем (Schema Organization)

Все схемы таблиц хранятся централизованно в директории модуля базы данных: `apps/api/src/app/core/database/schemas/*.schema.ts`.

Каждый файл схемы (`.schema.ts`) обязан:

1. Определять таблицы, индексы и перечисления (enums).
2. Определять отношения через `defineRelations`.
3. Экспортировать два объекта:
    - `schema`: Содержит все таблицы и enums файла. Используется для инициализации Drizzle.
    - `relations`: Содержит описание связей. Используется для поддержки `db.query.*` (Relational Query API).

Пример файла `animals.schema.ts`:

```ts
export const animals = pgTable('animals', { ... });
export const animalsRelations = defineRelations({ ... });

export const relations = animalsRelations;
export const schema = { animals, animalStatusEnum };
```

Все схемы собираются в `apps/api/src/app/core/database/schemas/index.ts` для передачи в клиент Drizzle.

### 1.3. Naming Conventions (Соглашения об именовании)

## 2. Стандартные поля (Audit Fields)

Каждая сущность (кроме таблиц связей many-to-many) обязана иметь следующие поля:

1. id: uuid — Первичный ключ. Генерируется на стороне БД (defaultRandom).
2. createdAt: timestamp — Дата создания (defaultNow).
3. updatedAt: timestamp — Дата обновления ($onUpdate).
4. deletedAt: timestamp (Nullable) — Для реализации Soft Delete (если применимо).

Пример миксина (helper) для переиспользования:

```ts
export const timestamps = {
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date()),
	deletedAt: timestamp('deleted_at')
};
```

## 3. Типы данных

- ID -> uuid (Не используем auto-increment integer, это небезопасно и мешает репликации).
- Strings -> text (В Postgres нет смысла использовать varchar(255), text работает так же быстро).
- Enums -> pgEnum (Создаем типы enum в базе для статусов: 'DRAFT', 'PUBLISHED').
- Money -> integer (Храним в копейках!) или decimal(10, 2). Предпочтительнее integer для избежания ошибок округления.
- JSON -> jsonb (Для хранения слабоструктурированных данных, например, настроек уведомлений).

## 4. Отношения и Внешние ключи

Все связи должны быть явно определены на уровне БД через .references().

```ts
export const animals = pgTable('animals', {
	// ...
	curatorId: uuid('curator_id').references(() => users.id, { onDelete: 'set null' })
});
```

Правила удаления (On Delete):

- 'cascade' — Если удаляется родитель, удаляются и дети (например, удалили Животное -> удалились его Фото).
- 'set null' — Если удаляется родитель, ссылка становится null (например, удалили Куратора -> животное осталось без куратора).
- 'restrict' — Запретить удаление родителя, если есть дети (например, нельзя удалить Животное, если у него есть активные Донаты).

## 5. Миграции (Drizzle Kit)

Мы используем декларативный подход.

1. Разработчик меняет .schema.ts файл.
2. Запускает nx drizzle-generate api.
3. Drizzle создает SQL файл миграции.
4. Разработчик проверяет SQL файл.
5. Миграции применяются при деплое (в CI/CD пайплайне) командой drizzle-kit migrate.

ВАЖНО: Никогда не правьте SQL файлы миграций вручную, если это не data-migration.

## 6. Seeding (Начальные данные)

Для локальной разработки и E2E тестов нам нужны данные.
Скрипт сидинга должен:

1. Очищать базу (truncate) при флаге --reset.
2. Создавать Админа (admin@pif.xyz / admin).
3. Создавать набор справочников (категории товаров).
4. Создавать тестовых животных (10 шт) и волонтеров.

Используем библиотеку 2 для генерации реалистичных данных.
