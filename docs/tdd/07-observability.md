# 07. Observability & Monitoring Standards

Документ описывает стек и правила мониторинга.
Наша цель: узнавать о проблемах раньше пользователей.

## 1. Стек (Monitoring Stack)

Мы используем стандартный **PLG стэк** (Promtail + Loki + Grafana) для логов и **Prometheus** для метрик.

1.  **Loki:** Агрегация логов. Эффективно хранит текстовые данные.
2.  **Promtail:** Агент, который читает логи Docker-контейнеров и отправляет их в Loki.
3.  **Prometheus:** Сбор метрик (Time Series Database). Pull-модель (сам ходит в API и забирает цифры).
4.  **Grafana:** Визуализация всего этого на дашбордах.
5.  **Alertmanager:** Отправка уведомлений в Telegram/Email, если что-то сломалось.

## 2. Логирование (Logging)

### 2.1. Формат (JSON)
В продакшене (Production) логи должны быть **строго в формате JSON**. Это позволяет Loki индексировать поля и быстро искать ("найти все ошибки, где userId = X").
В разработке (Dev) допустим pretty-print для читаемости.

Используем библиотеку: `nestjs-pino`.

Пример правильного лога:
```json
{
  "level": "info",
  "time": 1678888888,
  "pid": 12,
  "hostname": "api-deployment-xyz",
  "reqId": "c8b4f1-...",
  "msg": "Animal created successfully",
  "animalId": "uuid-..."
}
```

### 2.2. Traceability (Request ID)
Мы используем `ClsService` (из `nestjs-cls`) или `AsyncLocalStorage`, чтобы пробрасывать уникальный `X-Request-ID` через все слои приложения.
Этот ID должен присутствовать в КАЖДОЙ строке лога, относящейся к запросу. Это позволяет отследить путь запроса от Nginx до ошибки в базе данных.

### 2.3. Уровни логирования (Log Levels)
* **ERROR:** Ошибка, требующая вмешательства (упала БД, не прошел платеж). Триггерит алерт.
* **WARN:** Нештатная ситуация, но система работает (пользователь ввел неверный пароль 5 раз, API вернул 400).
* **INFO:** Важное бизнес-событие (запуск приложения, создание опекунства). Не нужно логировать каждый GET запрос (это шум), только мутации.
* **DEBUG:** Техническая информация для отладки (входящий payload, сырой ответ банка). В проде обычно выключен или включается точечно.

### 2.4. Безопасность (Log Redaction)
Строжайше запрещено логировать:
* Пароли и хэши.
* Токены (Session tokens, API keys).
* PII (Email, Телефоны) — желательно маскировать (`i***@mail.ru`).

Используем `pino-redact` для автоматической вырезки чувствительных полей.

## 3. Метрики (Metrics)

Используем `@willsoto/nestjs-prometheus`.
Приложение выставляет метрики по адресу `/metrics` (защищено Basic Auth или доступно только внутри сети Docker).

### 3.1. Технические метрики (System)
Собираются автоматически (Default Metrics):
* `nodejs_eventloop_lag_seconds` — Лаг ивент лупа (если > 1с, сервер умирает).
* `process_cpu_user_seconds_total` — Загрузка CPU.
* `process_resident_memory_bytes` — Потребление памяти (утечки).

### 3.2. HTTP Метрики
* `http_request_duration_seconds` (Histogram) — Время ответа API.
    * Label: `route` (/animals), `method` (POST), `status_code` (200, 500).
    * Важно следить за 95-м и 99-м перцентилем (p99).

### 3.3. Бизнес-метрики (Business)
Мы создаем кастомные счетчики (Counter/Gauge) в коде:
* `app_donations_total` (Counter) — Сумма денег (+ label `currency`).
* `app_animals_adopted_total` (Counter) — Кол-во пристройств.
* `app_active_guardians` (Gauge) — Текущее кол-во активных подписок.

## 4. Health Checks

Используем NestJS Terminus (`@nestjs/terminus`).
Эндпоинт: `/health`.

Проверяем:
1. **Database:** Пинг к PostgreSQL (Select 1).
2. **Memory:** Heap size не превышает лимит (например, 300MB).
3. **Redis:** (Если используется) Пинг.
4. **Storage:** (Опционально) Доступность S3.

Docker Swarm использует этот эндпоинт, чтобы перезагрузить контейнер, если он завис ("Unhealthy").

## 5. Алертинг (Alertmanager Rules)

Базовые правила, которые нужно настроить:
1. **HighErrorRate:** Если кол-во 500-х ошибок > 1% за 5 минут -> Critical Alert в Telegram.
2. **HighLatency:** Если p95 latency > 2 секунд за 5 минут -> Warning.
3. **ContainerRestart:** Если контейнер перезагружается чаще раза в час -> Warning.