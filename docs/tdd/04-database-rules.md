# 04. Database Design & Drizzle ORM Guidelines

Документ описывает стандарты проектирования базы данных PostgreSQL и правила использования Drizzle ORM.

## 1. Общие принципы

### 1.1. Стек
* Database: PostgreSQL (Latest stable).
* ORM: Drizzle ORM.
* Migration Tool: Drizzle Kit.

### 1.2. Naming Conventions (Соглашения об именовании)

Мы используем маппинг имен: в базе — snake_case, в коде — camelCase.

* Таблицы: snake_case, множественное число (users, animals, donations).
* Колонки (DB): snake_case (created_at, is_active).
* Поля (TS): camelCase (createdAt, isActive).
* Индексы: table_column_idx (например, animals_status_idx).
* Foreign Keys: table_column_fk.

Пример определения в Drizzle:
```ts
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firstName: text('first_name').notNull(), 
});
```
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
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp('deleted_at'),
};
```
## 3. Типы данных

* ID -> uuid (Не используем auto-increment integer, это небезопасно и мешает репликации).
* Strings -> text (В Postgres нет смысла использовать varchar(255), text работает так же быстро).
* Enums -> pgEnum (Создаем типы enum в базе для статусов: 'DRAFT', 'PUBLISHED').
* Money -> integer (Храним в копейках!) или decimal(10, 2). Предпочтительнее integer для избежания ошибок округления.
* JSON -> jsonb (Для хранения слабоструктурированных данных, например, настроек уведомлений).

## 4. Отношения и Внешние ключи

Все связи должны быть явно определены на уровне БД через .references().
```ts
export const animals = pgTable('animals', {
  // ...
  curatorId: uuid('curator_id')
    .references(() => users.id, { onDelete: 'set null' }),
});
```
Правила удаления (On Delete):
* 'cascade' — Если удаляется родитель, удаляются и дети (например, удалили Животное -> удалились его Фото).
* 'set null' — Если удаляется родитель, ссылка становится null (например, удалили Куратора -> животное осталось без куратора).
* 'restrict' — Запретить удаление родителя, если есть дети (например, нельзя удалить Животное, если у него есть активные Донаты).

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