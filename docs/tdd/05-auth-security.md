# 05. Authentication & Security (Better-Auth + RBAC)

Документ описывает архитектуру аутентификации и авторизации.

## 1. Архитектура библиотек

Мы разделяем ответственность для избежания циклических зависимостей:

1.  **`libs/database`**: Хранит схемы таблиц (`user`, `session`, `account`, `verification`) и подключение к БД.
2.  **`libs/auth`**: Конфигурация `better-auth`. Зависит от `database`. Экспортирует инстанс `auth` для использования в API.
3.  **`libs/email-templates`**: React-компоненты писем (Invite, Reset Password). Не зависит от бэкенда.
4.  **`libs/mail`**: Сервис отправки писем (Nodemailer/Resend). Использует шаблоны из `email-templates`.
5.  **`apps/api`**: Основной потребитель. Использует `auth` для Guards и `mail` для отправки приглашений.

## 2. Схема данных (User Schema)

Таблица `user` расширена следующими полями:

```ts
export const user = pgTable('user', {
	// Standard Better-Auth fields
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('emailVerified').notNull(),
	image: text('image'),

	// Custom RBAC fields
	role: userRole('role')
		.notNull()
		.default(() => UserRole.VOLUNTEER),
	position: text('position'), // "Кинолог", "Водитель" (для отображения)
	banned: boolean('banned').default(false).notNull(),

	createdAt: timestamp('createdAt').notNull(),
	updatedAt: timestamp('updatedAt').notNull()
});
```

## 3. Процессы (Flows)

### 3.1. Seed (Первоначальная настройка)

При запуске приложения проверяется наличие пользователей.
Если таблица пуста -> Создается Root Admin из переменных окружения (`ADMIN_EMAIL`, `ADMIN_PASSWORD` из `.env`).

### 3.2. Invitation Flow (Приглашение)

Регистрация закрыта. Используется плагин `invitation` от better-auth и кастомная логика.

1.  **Admin** вызывает API: `POST /admin/users/invite` { email, role, position }.
2.  **API** (CreateInvitationHandler) генерирует токен, сохраняет в БД.
3.  **MailService** (Event Handler) отправляет ссылку: `https://domain.com/accept-invite?token=xyz`.
4.  **User** переходит по ссылке, вводит данные.
5.  **API** (AcceptInvitationHandler):
    - Валидирует токен и условия через **`AcceptInvitationPolicy`** (срок, статус, уникальность).
    - Создает пользователя в `better-auth`.
    - Помечает приглашение использованным.
    - _Важно:_ Операции выполняются последовательно без общей БД транзакции (т.к. Auth провайдер может быть внешним). В случае ошибки после создания пользователя применяется **компенсирующее действие** (удаление созданного аккаунта).

### 3.3. Authentication (Login)

- **Сотрудники:** Email + Password.
- **Опекуны:** Telegram Login (Widget) или Magic Link.

### 3.4. Authorization (Guards)

NestJS использует `AuthGuard` для проверки сессии из Cookie.

## 4. Безопасность

### 4.1. Session Management

- Используем `HttpOnly` `Secure` `SameSite=Lax` Cookies.
- При бане пользователя вызывается `auth.api.revokeUserSessions`, что мгновенно инвалидирует все токены.

### 4.2. Rate Limiting

- Login/Invite endpoints: Строгое ограничение (5 req/min) для защиты от брутфорса и спама письмами.

### 4.3. Audit

- Все критические действия (смена роли, бан, изменение карточки животного) логируются с привязкой к `userId`.
