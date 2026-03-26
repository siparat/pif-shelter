# ADR-012: Ежемесячные публичные XLSX-отчеты как артефакты

- **Status:** Accepted
- **Date:** 2026-03-26
- **Author:** Backend Team

## Context

Нужно автоматически формировать и публиковать ежемесячный финансовый отчет в формате XLSX:

1. Генерация по расписанию (1-го числа за предыдущий месяц).
2. Возможность ручной регенерации из admin API.
3. Публичная ссылка на готовый отчет.
4. В расходах отчета — кликабельный переход к чеку без хранения постоянных URL в БД.

Синхронная генерация в HTTP-запросе не подходит из-за длительности и рисков повторных запусков.

## Decision

1. **Отчет — это артефакт в S3**, а не on-demand stream из endpoint.
2. **Статусная таблица артефактов** `monthly_finance_reports`:
    - `year`, `month`, `report_type`, `status`, `storage_key`, `checksum_sha256`, `generated_at`, `error_message`.
    - уникальность: `year + month + report_type`.
3. **Генерация через BullMQ**:
    - repeat-job по cron `0 0 1 * *` (UTC),
    - period = предыдущий месяц,
    - ручная регенерация командой с `forceRegenerate`.
4. **Read-проекция данных отчета** в отдельном QueryHandler (CQRS read-side, Drizzle direct access).
5. **Публичный доступ к XLSX**:
    - API отдает URL, собранный из `storage_key`.
6. **Чеки в отчете**:
    - hyperlink ведет в backend redirect endpoint,
    - endpoint выдает `302` на `presigned GET`,
    - в БД хранится только `receipt_storage_key`.

## Consequences

### Positive

- Предсказуемая и идемпотентная генерация отчетов.
- Отсутствие тяжелой синхронной нагрузки на HTTP endpoint.
- Простая диагностика через `status/error_message/checksum`.
- Соответствие ADR-005: в БД только storage key, URL формируются на чтении.

### Negative

- Усложнение системы (очередь + таблица артефактов + scheduler/processor).
- Появляется задержка между запросом и готовностью отчета.
- Нужен мониторинг фоновых задач и алерты.

## Compliance

1. Для redirect endpoint запрещено возвращать `200 + Location`; нужен `3xx`.
2. Для отчетов нельзя хранить полный URL в БД — только `storage_key`.
3. Команды генерации обязаны быть безопасны к повторным вызовам (idempotent by period+type).
