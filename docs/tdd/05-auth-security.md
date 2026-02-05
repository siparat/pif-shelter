# 05. Authentication & Security (Better-Auth + RBAC)

Документ описывает архитектуру аутентификации и авторизации.
Мы используем библиотеку Better-Auth для управления сессиями и OAuth.

## 1. Архитектура Аутентификации

Мы используем Session-Based Authentication (Cookie).

### 1.1. Компоненты
1. Database: Хранит таблицы user, session, account, verification.
2. Next.js (Frontend): Реализует UI входа/регистрации и API-роуты Better-Auth (/api/auth/*).
3. NestJS (Backend): Валидирует входящие запросы по Session Cookie.

### 1.2. Поток (Flow)
1. Пользователь заходит на сайт, жмет "Войти через Google".
2. Next.js (Better-Auth) обрабатывает OAuth callback.
3. Better-Auth создает запись в таблице session и устанавливает HttpOnly Cookie (better-auth.session_token) пользователю.
4. Клиент делает запрос к API (NestJS): GET /api/animals. Кука летит автоматически (если домены совпадают или настроен CORS + Credentials).
5. NestJS (AuthGuard) берет токен из куки.
6. NestJS проверяет наличие сессии в БД (через Better-Auth Node Client или прямой SQL запрос).
7. Если сессия валидна — запрос проходит.

## 2. Ролевая модель (RBAC)

Мы используем жесткую ролевую модель.
Роли хранятся в поле role таблицы user.

### 2.1. Список ролей (Enum)
* ADMIN — Полный доступ. Управление пользователями.
* SENIOR_VOLUNTEER — Редактирование всех животных, сборы, модерация.
* VOLUNTEER — Редактирование только своих подопечных.
* GUARDIAN — Опекун (только чтение спец. контента, доступ к боту).
* USER — Обычный пользователь (гость).

### 2.2. Защита Эндпоинтов (Decorators)
В NestJS мы используем кастомные декораторы для декларативной защиты.

Пример использования в Контроллере:
```ts
@Controller('animals')
export class AnimalsController {
  
  @Post()
  @Roles('ADMIN', 'SENIOR_VOLUNTEER')
  async create(@Body() dto: CreateAnimalDto) { ... }

  @Patch(':id')
  @Roles('VOLUNTEER') 
  async update(@User() user: UserEntity, @Param('id') id: string) { ... }
}
```
## 3. Безопасность

### 3.1. CORS (Cross-Origin Resource Sharing)
* origin: разрешаем только доверенные домены.
* credentials: true (Обязательно, иначе куки не будут ходить).

### 3.2. Rate Limiting (Защита от DDoS/Spam)
Используем @nestjs/throttler + Redis.

Глобальные лимиты:
* Public API (GET): 100 запросов в минуту.
* Auth API (Login/SMS): 5 запросов в минуту (строго!).
* Mutations (POST/PATCH): 20 запросов в минуту.

При превышении -> 429 Too Many Requests.

### 3.3. Data Protection
* Email пользователей видят только Админы.
* Телефоны волонтеров скрыты от обычных пользователей.
* В логах никогда не пишем PII (Personal Identifiable Information) и токены.

## 4. Better-Auth Configuration (Shared)

Конфигурация (схемы таблиц) должна быть синхронизирована.
В монорепозитории мы держим конфиг Better-Auth в libs/shared/auth-config, чтобы и Next.js, и NestJS (если понадобится) использовали одни и те же настройки адаптеров БД.

Таблицы, создаваемые Better-Auth (автоматически):
* user
* session
* account (для OAuth привязок)
* verification (для email токенов)