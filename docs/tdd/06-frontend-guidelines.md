# 06. Frontend Guidelines (Next.js + Refine)

Документ описывает стандарты разработки клиентских приложений.
У нас два приложения:
1. apps/app — Публичный сайт (Next.js App Router). Фокус на SEO, SSR и Performance.
2. apps/admin — Админка (Vite + React + Refine). Фокус на SPA, PWA и скорости разработки форм.

## 1. Структура и Стек

### 1.1. Общий стек (Shared)
* Styling: Tailwind CSS.
* UI Kit: shadcn/ui.
* Icons: Lucide React.
* State Server: TanStack Query v5.
* Forms: React Hook Form + Zod Resolver.
* Utils: clsx + tailwind-merge (функция cn()).

### 1.2. apps/app (Next.js)
Используем App Router.
* Server Components (RSC) — по умолчанию. Используем для фетчинга данных, которые нужны для SEO (карточка животного).
* Client Components ('use client') — только для интерактивности (кнопки, формы, слайдеры).
```text
Структура:
apps/app/app/
  (routes)/
    animals/
      [slug]/
        page.tsx
        loading.tsx
    layout.tsx
  components/
```
### 1.3. apps/admin (Refine)
SPA приложение.
* Используем Refine для генерации CRUD.
* Ресурсы (Resources) определяются в App.tsx.

```text
Структура:
apps/admin/src/
  pages/
    animals/
      list.tsx
      edit.tsx
      create.tsx
  providers/
```

## 2. Работа с данными (TanStack Query)

Мы НЕ вызываем fetch/axios напрямую в компонентах. Мы используем кастомные хуки.

### 2.1. Query Keys Factory
Чтобы не запутаться в ключах кэша, храним их в одном объекте (в libs/frontend/api-client).
```ts
export const animalKeys = {
  all: ['animals'] as const,
  lists: () => [...animalKeys.all, 'list'] as const,
  list: (filters: string) => [...animalKeys.lists(), { filters }] as const,
  details: () => [...animalKeys.all, 'detail'] as const,
  detail: (id: string) => [...animalKeys.details(), id] as const,
};
```
### 2.2. Custom Hooks (Data Access Layer)
Вся логика запросов инкапсулируется в хуках.

```ts
export const useAnimal = (id: string) => {
  return useQuery({
    queryKey: animalKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get(`/animals/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
```

### 2.3. Mutations
Для изменений данных используем useMutation. Обязательно делаем инвалидацию кэша после успеха.

```ts
export const useCreateAnimal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newAnimal: CreateAnimalDto) => apiClient.post('/animals', newAnimal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalKeys.lists() });
      toast.success('Животное добавлено!');
    },
  });
};
```

## 3. Формы и Валидация

Мы используем единые схемы валидации с бэкендом (Shared DTO).

Паттерн создания формы:
1. Импортируем схему из libs/shared/dto.
2. Подключаем zodResolver.

```ts
const form = useForm<CreateAnimalDto>({
  resolver: zodResolver(createAnimalSchema),
  defaultValues: {
    name: '',
    age: 0,
  },
});

const onSubmit = (data: CreateAnimalDto) => {
  mutate(data);
};
```

## 4. UI Kit (shadcn/ui)

Компоненты лежат в libs/shared/ui-kit.
Мы не импортируем их из @/components/ui, мы импортируем их из библиотеки:
```ts
import { Button } from '@pif/ui-kit';
```

### 4.1. Кастомизация
Если нужно изменить стиль кнопки глобально — правим в libs/shared/ui-kit/src/button.tsx.
Если нужно изменить стиль кнопки локально — используем className и утилиту cn().
```ts
<Button className={cn("bg-red-500", className)}>Delete</Button>
```
## 5. Оптимизация (Web Vitals)

### 5.1. Изображения
Для apps/app (Next.js) ОБЯЗАТЕЛЬНО использовать компонент <Image />.
* Задавать width/height (для избежания Layout Shift - CLS).
* Использовать placeholder="blur" для LCP.

### 5.2. Шрифты
Используем next/font. Шрифты должны быть локальными (self-hosted), Google Fonts не грузим с CDN.

## 6. PWA (Только Admin)

Для админки настроен vite-plugin-pwa.
* manifest.json должен содержать корректные иконки.
* Service Worker кэширует статику (JS, CSS), чтобы админка открывалась офлайн (но данные грузятся только с сетью).
* При обновлении версии приложения пользователю показывается тост: "Доступна новая версия. Обновить?".