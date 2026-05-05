# 06. Frontend Guidelines (Vite + React + FSD)

Документ описывает стандарты разработки клиентских приложений.
У нас два приложения, оба построены на одном стеке:

1. apps/web — Публичный сайт (Vite + React 19 + react-router-dom v6).
2. apps/admin — Админка (Vite + React 19 + react-router-dom v6 + PWA через `vite-plugin-pwa`).

Архитектурный стандарт обоих приложений — **Feature-Sliced Design (FSD)** (см. ADR-014).

## 1. Структура и Стек

### 1.1. Общий стек (Shared)

- Bundler: Vite 7.
- Routing: react-router-dom v6 (`createBrowserRouter` + `lazy()` для разделения бандла).
- Styling: Tailwind CSS v4 (через `@tailwindcss/vite`).
- Icons: Lucide React.
- State Server: TanStack Query v5.
- HTTP-клиент: `ky`.
- Forms: React Hook Form + Zod Resolver (`@hookform/resolvers`).
- Rich text: TipTap 3 (для постов в админке).
- Drag-and-drop: `@dnd-kit/*`.
- Утилиты: `clsx` + `tailwind-merge` (функция `cn()`), `dompurify`, `dayjs`.

### 1.2. Структура (FSD)

Каждое приложение имеет одинаковые слои:

```text
apps/<app>/src/
├── app/          # Инициализация, провайдеры, роутер
├── pages/        # Страницы (ленивые чанки)
├── widgets/      # Композиции из features/entities (Layout, Header)
├── features/     # Функциональность (формы, действия)
├── entities/     # Бизнес-сущности (типы, queries, мелкие UI-блоки)
├── shared/       # api, config, ui, lib (переиспользуемое)
└── main.tsx
```

Внутри слайса (например `pages/animal`) принят шаблон `ui/<ComponentName>/<ComponentName>.tsx` плюс публичный API через `index.ts`. Импорты строго сверху вниз: `app → pages → widgets → features → entities → shared`.

### 1.3. Именование (PascalCase для UI)

См. ADR-014:

- Папки и файлы UI-компонентов (с JSX): **PascalCase** (`AnimalsPage.tsx`).
- Хуки, утилиты, конфиги, стили: **kebab-case**.
- Компоненты объявляются только через **arrow function**: `const Component = (): JSX.Element => ...`.

## 2. Работа с данными (TanStack Query + ky)

Мы НЕ вызываем `fetch` напрямую в компонентах. HTTP-клиент `ky` инкапсулирован в `shared/api/`, а сами запросы — в `entities/<name>/api` или `features/<name>/api` через хуки.

### 2.1. Query Keys Factory

Чтобы не запутаться в ключах кэша, храним их рядом с хуками:

```ts
export const animalKeys = {
	all: ['animals'] as const,
	lists: () => [...animalKeys.all, 'list'] as const,
	list: (filters: string) => [...animalKeys.lists(), { filters }] as const,
	details: () => [...animalKeys.all, 'detail'] as const,
	detail: (id: string) => [...animalKeys.details(), id] as const
};
```

### 2.2. Custom Hooks (Data Access Layer)

Вся логика запросов инкапсулируется в хуках:

```ts
export const useAnimal = (id: string) =>
	useQuery({
		queryKey: animalKeys.detail(id),
		queryFn: () => apiClient.get(`animals/${id}`).json<AnimalDto>(),
		enabled: Boolean(id)
	});
```

### 2.3. Mutations

Для изменений используем `useMutation`. Обязательна инвалидация кэша после успеха:

```ts
export const useCreateAnimal = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (dto: CreateAnimalDto) => apiClient.post('animals', { json: dto }).json(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
			toast.success('Животное добавлено!');
		}
	});
};
```

## 3. Формы и Валидация

Мы используем единые Zod-схемы из `libs/contracts` и на бэкенде, и на фронте.

```ts
const form = useForm<CreateAnimalDto>({
	resolver: zodResolver(createAnimalSchema),
	defaultValues: { name: '', age: 0 }
});

const onSubmit = (data: CreateAnimalDto): void => mutate(data);
```

## 4. UI

Собственный набор компонентов лежит в `apps/<app>/src/shared/ui`. Глобального UI-кита в `libs` нет — UI-компоненты не переиспользуются между web и admin (у них разные дизайн-системы).

### 4.1. Кастомизация классов

Используем утилиту `cn` (комбинация `clsx` + `tailwind-merge`):

```tsx
<button className={cn('bg-red-500', className)}>Delete</button>
```

Запрещено конкатенировать классы строкой или использовать `@apply` — только `cn` (см. ADR-014).

## 5. Оптимизация

### 5.1. Изображения

Перед отправкой на сервер изображения сжимаются и конвертируются в WebP **на клиенте** (см. ADR-005). Для отображения используем относительные ключи из S3, преобразуя их в URL только в presentation-слое.

### 5.2. Code splitting

Страницы подключаются через `React.lazy` + `Suspense` в `app/router.tsx`, чтобы не раздувать начальный бандл.

## 6. PWA (Только Admin)

Для админки настроен `vite-plugin-pwa`.

- `manifest.json` должен содержать корректные иконки.
- Service Worker кэширует статику; данные грузятся только с сетью.
- При обновлении версии приложения пользователю показывается тост: «Доступна новая версия. Обновить?» (через `workbox-window`).
