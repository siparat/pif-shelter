# ADR-011: Платежи (мок PSP), книга учёта (ledger) и донаты

- **Status:** Accepted
- **Date:** 2026-03-22
- **Author:** Backend Team
- **Context:**
  В проекте вводятся разовые и ежемесячные донаты, общая книга проводок, ручные расходы волонтёров с чеком и связь с опекой. PSP пока что мок; нужны единые правила денег, идемпотентности, маршрутизации вебхука и минимального набора доменных событий без разрастания MVP.

- **Decision:**
    1. **Деньги и знак проводки:** суммы хранятся в **копейках** как PostgreSQL `integer`. Знак операции задаётся полем **`direction`** (`INCOME` / `EXPENSE`); значения `gross_amount`, `fee_amount`, `net_amount` в БД **неотрицательные** (см. `@pif/shared` `LedgerEntryDirectionEnum`).
    2. **Семантика сумм:** для доходов — `gross_amount`, `fee_amount`, `net_amount` (нетто после комиссии). Для ручного расхода (`MANUAL_EXPENSE`): **`fee_amount = 0`**, **`gross_amount = net_amount`**.
    3. **Идемпотентность:** в таблице `ledger_entries` колонка **`provider_payment_id`** с уникальным ограничением; **несколько `NULL` допустимы** (PostgreSQL), что покрывает проводки без PSP (ручной расход).
    4. **Источник проводки (`source`):** `DONATION_ONE_OFF`, `DONATION_SUBSCRIPTION`, `GUARDIANSHIP`, `MANUAL_EXPENSE` — совпадает с `LedgerEntrySourceEnum` в `@pif/shared` и будущим `pgEnum` в Drizzle.
    5. **Маршрутизация вебхука:** последовательный резолв: **опека** по `subscription_id` → **донат-подписка** по `subscription_id` → **разовый донат** по `transaction_id`.
    6. **Событие успешного списания по опеке:** на каждый успешный сценарий `subscription.succeeded` по опеке (первая оплата и продление) публикуется **`GuardianshipSubscriptionChargeSucceededEvent`** с данными, достаточными для идемпотентной записи в ledger (в т.ч. `provider_payment_id`, суммы, привязка к опеке).
    7. **Обработчики событий в MVP:** **один** зарегистрированный `EventsHandler` в модуле **`finance`**, который по `GuardianshipSubscriptionChargeSucceededEvent` создаёт доходную проводку в книге. События донатов и ручных расходов в MVP **без** подписчиков, пишущих в ledger (запись через команды модулей при необходимости).
    8. **Публичный отчёт:** отображение имени донора только если **`hide_public_name === false`**; сами чеки (изображения/файлы) в отчёте **без** маскирования.
    9. **Валюта:** в ledger поле `currency`, по умолчанию **`RUB`**. Иные валюты и крипта — **вне scope** MVP.
    10. **Мок-комиссия PSP:** единая константа **`MOCK_PAYMENT_FEE_BASIS_POINTS`** в `@pif/shared`; расчёт комиссии и нетто — в `@pif/payment` и хендлерах вебхука, без «магических» чисел в коде.
    11. **Лимиты суммы доната:** минимум и максимум в копейках — **`DONATION_MIN_AMOUNT_KOPECKS`**, **`DONATION_MAX_AMOUNT_KOPECKS`** в `@pif/shared`; при смене продуктовых лимитов править константы и при необходимости вынести в config в отдельном ADR.
    12. **Статусы намерения разового доната (MVP):** `PENDING`, `SUCCEEDED`, `FAILED` (`DonationOneTimeIntentStatusEnum`).
    13. **Статусы донат-подписки (MVP):** `PENDING_FIRST_PAYMENT`, `ACTIVE`, `CANCELLED`, `FAILED` (`DonationSubscriptionStatusEnum`). Переходы: создание → `PENDING_FIRST_PAYMENT` до первого успеха → `ACTIVE`; отмена пользователем/процессом → `CANCELLED` с заполнением `cancelled_at` при необходимости; терминальная ошибка оплаты → `FAILED`.

- **Consequences:**
    - **Positive:** одна модель денег и идемпотентности; предсказуемый вебхук; минимум связности через одно событие опеки и один handler в finance.
    - **Negative:** донаты и расходы без event-driven записи в ledger в MVP — больше ответственности на command-side и согласованность с `provider_payment_id` вручную.

- **Compliance:**
    - Не хранить суммы донатов/ledger в рублях с плавающей точкой без явного решения; предпочтительно integer в копейках ([docs/tdd/04-database-rules.md](docs/tdd/04-database-rules.md)).
    - Ключ чека в БД — только storage key (`text`), не полный URL (см. ADR-005 и TDD-04).
    - Комиссии и лимиты донатов — только из `@pif/shared`.
