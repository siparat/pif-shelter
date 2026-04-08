# ПИФ

Веб-платформа для **приюта бездомных животных «ПИФ»** (Донецк).

**Миссия:** Цифровизация процессов приюта для увеличения числа пристройств и обеспечения финансовой прозрачности. Платформа служит мостом между животными и потенциальными хозяевами и донорами.

**Целевая аудитория:** потенциальные хозяева (поиск питомца), доноры (пожертвования, прозрачность расходов), волонтёры (ведение базы и отчётов с телефона).

**Дизайн (Figma):** [ПИФ — Сайт](https://www.figma.com/design/UqKc0Mvsw0Fe6aioX2dUXd/%D0%9F%D0%98%D0%A4-%D0%A1%D0%B0%D0%B9%D1%82?node-id=0-1&t=2fXD9qfKRb5iuQbd-1)

---

## Стек

- **Монорепозиторий:** [Nx](https://nx.dev)
- **API:** NestJS 11, Fastify, CQRS, Better Auth
- **БД:** PostgreSQL 17, [Drizzle ORM](https://orm.drizzle.team)
- **Кэш и очереди:** Redis (cache + BullMQ)
- **Файлы:** S3-совместимое хранилище (presigned upload)
- **Почта:** Nodemailer + React Email
- **Бот:** Telegraf (nestjs-telegraf)
- **Контракты и валидация:** Zod, libs/contracts

Архитектура: modular monolith, гибридный repository pattern (write — репозитории, read — прямые запросы в Query Handlers), cache-aside для чтения, инвалидация кэша через доменные события.

---

## Структура

```
apps/
  api/                 # NestJS API (единственное приложение на данный момент)
libs/
  cache/               # Redis-клиент
  config/              # Конфигурация приложений
  contracts/           # Zod-схемы, DTO, контракты API
  database/            # Drizzle, схемы, миграции
  email-templates/     # Шаблоны писем (React Email)
  shared/              # Enum, константы, утилиты
  storage/             # S3-клиент
docs/
  adr/                 # Architecture Decision Records
  tdd/                 # Стандарты API, TDD
```

Доменные модули API: `animals`, `donations`, `guardianship`, `campaigns`, `wishlist`, `meeting-requests`, `payments`, `finance`, `posts`, `admin/users`, `admin/dashboard`, `media`, `telegram-bot`, `core`.

---

## Готовый функционал API

- Каталог и карточки животных, посты, медиа, заявки на знакомство.
- Пожертвования, платежные вебхуки, опекунство, кампании сборов и список нужд.
- Финансовая выгрузка в `XLSX` (генерация месячных отчетов и выдача ссылок на скачивание).
- Админский контур пользователей: приглашения в команду, принятие инвайта, управление флагом `telegram_unreachable`.
- Telegram-бот для опекунов: привязка по токену, `/my_animals`, `/report`, `/help`, `/unsubscribe` (отмена опекунства).
- Отмена рекуррентных донатов поддерживается через PSP и email-ссылки, не через Telegram-бота.

---

## Быстрый старт

### Требования

- Node.js 20+
- Docker и Docker Compose (для БД и Redis)
- Файл окружения для API (см. ниже)

### 1. Установка зависимостей

```bash
pnpm ci
```

### 2. Окружение

Создай `envs/.api.env` и `.env` (для docker compose) скопировав из примера.

### 3. Инфраструктура (БД, Redis)

```bash
docker compose up -d
```

Поднимаются: `database` (5432), `redis` (6379), `queue-redis` (6380). Для разработки можно поднять только их и запускать API локально.

### 4. Миграции

Применить существующие миграции:

```bash
npx nx run database:migrate
```

Создать новую миграцию (после изменения схем в `libs/database`):

```bash
npx nx run database:generate -- --name "название_миграции"
```

### 5. Запуск API

```bash
npx nx serve api
```

API будет доступен на порту из конфига (например 3000). Health: например `GET /health`.

---

## Полезные команды Nx

| Действие          | Команда                   |
| ----------------- | ------------------------- |
| Сборка API        | `npx nx build api`        |
| Тесты API         | `npx nx test api`         |
| Линт              | `npx nx run-many -t lint` |
| Граф зависимостей | `npx nx graph`            |

Миграции БД создаются только через:

```bash
npx nx run database:generate -- --name "название_миграции"
```

SQL-миграции вручную не пишем.

---

## Документация

- **Паспорт проекта, роли, фичи:** `docs/prd/` — обзор (01), глоссарий (00), роли (02), каталог животных (03), донаты (04), опекунство и Telegram (05), админка (06).
- **API и контракты:** `docs/tdd/03-api-standards.md` — формат ответов, коды ошибок, пагинация.
- **ADR:** `docs/adr/` — решения по репозиториям, кэшу, загрузке файлов, Telegram-боту и т.д.
- **Правила разработки:** `.cursor/rules/Main-Rules-PIF.mdc` — CQRS, стиль кода, логирование, миграции.

---

## Лицензия

MIT
