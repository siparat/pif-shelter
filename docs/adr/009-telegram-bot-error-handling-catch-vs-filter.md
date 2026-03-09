# ADR-009: Обработка ошибок Telegram API (403 и др.) — telegraf.catch и unhandledRejection вместо Nest Exception Filter

- **Status:** Accepted
- **Date:** 2026-03-09
- **Author:** Backend Team
- **Context:**
  При отправке сообщений пользователю (ctx.reply, sendMessage и т.д.) Telegram API может вернуть 403 «bot was blocked by the user». Нужно перехватывать такие ошибки, логировать их и помечать пользователя как unreachable (telegram_unreachable), не роняя процесс. Возник выбор: использовать Nest Exception Filter (@UseFilters + TelegrafExceptionFilter) или обработку на уровне Telegraf (bot.catch + при необходимости process.unhandledRejection).

- **Decision:**
  Обработка ошибок Telegram API (в первую очередь 403) выполняется **на уровне Telegraf**, а не через Nest Exception Filter:
    1. **telegraf.catch(handler)** — регистрируется в onModuleInit обработчика бота (TelegramBotUpdate). Перехватывает ошибки, возникшие внутри цепочки обработки обновления (middleware): когда обработчик вызывает ctx.reply() и получает 403, Telegraf передаёт исключение в этот handler.
    2. **process.on('unhandledRejection', ...)** — для ошибок, возникших **вне** цепочки обработки обновления: прямые вызовы bot.telegram.sendMessage(...) без await или из таймеров/фоновых задач. Такие вызовы возвращают промис; при 403 промис отклоняется, и без дополнительного перехвата это даёт unhandled rejection и возможный падение процесса.
       Nest Exception Filter (TelegrafExceptionFilter с @UseFilters) может оставаться для единообразия или будущего расширения, но **основная и гарантированная** обработка 403 — через telegraf.catch и unhandledRejection.

- **Reasons (почему не только фильтр):**
    1. **Ошибки из middleware доходят до Nest не всегда** — nestjs-telegraf регистрирует обработчики как middleware Telegraf; при reject из async-хендлера исключение может обрабатываться внутри Telegraf (handleUpdate → handleError) и не пробрасываться в Nest execution context. Фильтр срабатывает только когда исключение «долетает» до Nest, что зависит от реализации nestjs-telegraf.
    2. **Прямые вызовы API вне контекста обновления** — рассылки из джобов, тестовые sendMessage при старте, любой вызов bot.telegram.sendMessage(...) без привязки к входящему update не проходят через middleware и никогда не попадут в Nest Exception Filter. Для них единственная точка перехвата — либо .catch() на промисe, либо глобальный unhandledRejection.
    3. **telegraf.catch заменяет дефолтный handler** — в createBotFactory (nestjs-telegraf) по умолчанию регистрируется bot.catch(...). При вызове this.telegraf.catch(ourHandler) в onModuleInit мы подменяем этот handler. Так мы гарантированно обрабатываем все ошибки, которые Telegraf передаёт в handleError (т.е. из middleware).
    4. **Один контракт обработки** — логика «403 → найти пользователя по chat_id → setTelegramUnreachable» живёт в одном месте (handleTelegrafError); и telegraf.catch, и unhandledRejection вызывают её. chat_id берётся из ctx (если есть) или из err.on.payload для прямых вызовов API.

- **Consequences:**
    - **Positive:**
        - Все 403 перехватываются: и из хендлеров (ctx.reply), и из прямых sendMessage/рассылок.
        - Процесс не падает на unhandled rejection при 403.
        - Единая функция handleTelegrafError, тестируемая и переиспользуемая.
    - **Negative:**
        - Два «входа» в обработку (telegraf.catch и unhandledRejection); при изменении логики нужно править один метод, но не забыть про оба регистратора.
        - Глобальный unhandledRejection вешается в onModuleInit; при нескольких экземплярах бота теоретически возможны дубли обработчиков (в нашем случае один бот — приемлемо).

- **Compliance:**
    - Обработка 403 и пометка пользователя telegram_unreachable реализована в TelegramBotUpdate.handleTelegrafError и вызывается из telegraf.catch и при необходимости из process.unhandledRejection.
    - Прямые вызовы bot.telegram.sendMessage / sendPhoto и т.д. вне контекста входящего update должны либо иметь .catch(err => handleTelegrafError(err)), либо полагаться на глобальный unhandledRejection (текущее решение).
    - Не полагаться только на Nest Exception Filter для перехвата ошибок Telegram API из бота.
