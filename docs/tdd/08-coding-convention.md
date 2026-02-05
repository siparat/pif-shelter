# 08. Coding Standards & Conventions

Документ описывает единый стиль кодирования для всей команды.
Соблюдение этих правил контролируется автоматически через ESLint и Prettier.

## 1. Именование (Naming)

### 1.1. Файлы и Папки
Мы используем kebab-case для всех файлов и папок.
Это избавляет от проблем с чувствительностью к регистру в разных ОС.

* Правильно: animal-details.component.tsx, create-user.dto.ts
* Неправильно: AnimalDetails.tsx, createUserDto.ts

### 1.2. Классы и Компоненты
Мы используем PascalCase.

* Классы: class AnimalService {}
* Компоненты React: function AnimalCard() {}
* Интерфейсы: interface IAnimalRepository {}

### 1.3. Переменные и Функции
Мы используем camelCase.

* Переменные: const animalId = '...';
* Функции: function getAnimalById() {}

### 1.4. Булевы значения
Названия булевых переменных должны звучать как вопрос (Is? Has? Can?).

* Правильно: isPublished, hasGuardian, canEdit.
* Неправильно: published, guardian, edit.

### 1.5. Константы
* Глобальные константы (config): UPPER_SNAKE_CASE (MAX_RETRY_COUNT = 3).
* Локальные константы (внутри функции): camelCase.

## 2. TypeScript Rules

### 2.1. Строгая типизация
* noImplicitAny: true. Запрещено использовать неявный any.
* Explicit Return Types: Публичные методы классов и API-функции обязаны иметь явный тип возвращаемого значения.

Пример:
```ts
async findOne(id: string): Promise<AnimalDto> { ... }
```
### 2.2. Type vs Interface
* Используем type для DTO, Props, Union types.
* Используем interface для классов и наследования.

### 2.3. Enums
Используем const assertions вместо стандартных enum.

Пример:
```ts
export const AnimalStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;
export type AnimalStatus = keyof typeof AnimalStatus;
```

## 3. Архитектурные правила (NestJS)

### 3.1. DTO
* Запрещено передавать "сырые" объекты (any, Record) в контроллеры.
* Все поля DTO должны иметь декораторы валидации и Swagger (@ApiProperty).

### 3.2. Dependency Injection
* Используем constructor injection.
* Избегаем field injection (@Inject() над полем).

### 3.3. Config
Никогда не используем process.env напрямую. Только через ConfigService.

## 4. Архитектурные правила (React/Next.js)

### 4.1. Компоненты
* Только Functional Components.
* Один файл = Один основной компонент.

### 4.2. Props
Типизируем пропсы через type Props = { ... }. Не используем React.FC.

Правильно:
```ts
export function Button({ title }: Props) { ... }
```

### 4.3. Hooks
* Логика работы с API и сложными стейтами выносится в кастомные хуки.
* UI-компонент должен только отображать данные.

## 5. Комментарии и Документация в коде

### 5.1. Zero Comments Policy
Мы придерживаемся политики полного отсутствия комментариев в коде.
Код должен быть самодокументируемым (Self-documenting code).
Если вы чувствуете желание написать комментарий, чтобы объяснить, что делает код — лучше переименуйте переменную или вынесите логику в отдельную функцию с понятным названием.

### 5.2. Бизнес-логика и Решения
Любые неочевидные архитектурные или бизнес-решения (почему мы сделали именно так, а не иначе) описываются **не в коде**, а в проектной документации (папка /docs/adr).
Код содержит только реализацию ("Как"), документация содержит причины ("Почему").

### 5.3. Библиотеки (Libs)
Мы не используем JSDoc.
Источником истины служат типы TypeScript.
Названия методов и аргументов в библиотеках (libs/shared) должны быть настолько очевидными, чтобы подсказки IDE на основе типов были исчерпывающими.

## 6. Импорты

Используем абсолютные импорты (через алиасы tsconfig).

* Правильно: import { Button } from '@pif/ui-kit';
* Неправильно: import { Button } from '../../../libs/shared/ui-kit';