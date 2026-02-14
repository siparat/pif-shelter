# 09. Git Workflow & CI/CD Standards

Документ описывает процесс работы с системой контроля версий.
Мы используем **Trunk Based Development**. Это означает отсутствие долгоживущих веток (develop, release).

## 1. Стратегия ветвления (Branching Strategy)

### 1.1. Main Branch
Ветка main — единственный источник истины.
* Она всегда должна быть "зеленой" (проходить CI).
* Она всегда готова к деплою на продакшн.
* Прямой push в main **ЗАПРЕЩЕН**.

### 1.2. Feature Branches
Все изменения делаются в короткоживущих ветках, отпочковавшихся от main.

Формат имени ветки: type/short-description
* feat/auth-login
* fix/payment-bug
* refactor/database-schema
* chore/update-deps

Правило жизни ветки: Ветка должна жить не более 1-2 дней. Если задача крупная — используйте Feature Flags, но вливайте код в main часто.

## 2. Соглашение о коммитах (Conventional Commits)

Мы строго следуем спецификации Conventional Commits.
Это позволяет Nx автоматически генерировать Changelog и поднимать версии пакетов (`nx release`).

Формат: type(scope): description

### 2.1. Types
* feat: Новая функциональность (minor version bump).
* fix: Исправление бага (patch version bump).
* chore: Обслуживание, конфиги, обновление зависимостей (no version bump).
* refactor: Изменение кода без изменения функциональности.
* docs: Обновление документации.
* test: Добавление тестов.
* ci: Настройка CI/CD.

### 2.2. Scopes
Указываем модуль или приложение, которое затронуто.
* (api) — apps/api
* (app) — apps/app
* (admin) — apps/admin
* (shared) — libs/shared
* (deps) — обновление пакетов

Примеры:
* feat(api): add create animal endpoint
* fix(app): correct button color in dark mode
* chore(deps): upgrade nestjs to v11

## 3. Pull Requests (Merge Requests)

Любое изменение попадает в main только через Pull Request.

### 3.1. Создание PR
* Заголовок PR должен соответствовать формату Conventional Commits.
* Если задача не доделана, добавляем префикс Draft:.

### 3.2. Стратегия слияния (Merge Strategy)
Мы используем только **Squash and Merge**.

Почему:
В ветке фичи может быть 10 коммитов ("wip", "fix typo", "try again").
При слиянии в main они должны превратиться в ОДИН атомарный коммит: feat(auth): implement google oauth.
Это сохраняет историю main чистой и читаемой.

## 4. Автоматизация (Local Hooks)

Мы используем **Husky** для проверки кода ПЕРЕД тем, как он попадет в репозиторий.

### 4.1. Pre-commit Hook
Запускается при команде git commit.
Использует lint-staged для проверки ТОЛЬКО измененных файлов.

Действия:
1. Prettier — форматирует код.
2. ESLint — проверяет на ошибки.
3. TSC — проверяет типы (опционально, так как долго).

Если линтер находит ошибку, коммит отменяется. Разработчик обязан исправить код.

## 5. CI Pipeline (GitHub Actions)

Кнопка "Merge" становится активной только если все проверки прошли успешно (зеленые).