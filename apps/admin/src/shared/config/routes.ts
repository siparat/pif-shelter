import { type LucideIcon, LayoutDashboard, LogIn, MessageSquare, PawPrint, User, Users } from 'lucide-react';

export type RouteKey =
	| 'dashboard'
	| 'animals'
	| 'animalDetails'
	| 'animalEdit'
	| 'postCreate'
	| 'guardianships'
	| 'meetings'
	| 'user'
	| 'login';

export interface MenuItem {
	Icon: LucideIcon;
	name: string;
	shortName: string;
	path: string;
	preload: () => Promise<unknown>;
	showInMenu: boolean;
}

export interface AdminRoute extends MenuItem {
	key: RouteKey;
}

export const adminRoutes: AdminRoute[] = [
	{
		key: 'dashboard',
		path: '/',
		name: 'Обзор',
		shortName: 'Обзор',
		Icon: LayoutDashboard,
		preload: () => import('../../pages/dashboard/ui/DashboardPage/DashboardPage'),
		showInMenu: true
	},
	{
		key: 'animals',
		path: '/animals',
		name: 'Животные',
		shortName: 'Животные',
		Icon: PawPrint,
		preload: () => import('../../pages/animals/ui/AnimalsPage/AnimalsPage'),
		showInMenu: true
	},
	{
		key: 'animalDetails',
		path: '/animals/:id',
		name: 'Карточка животного',
		shortName: 'Карточка',
		Icon: PawPrint,
		preload: () => import('../../pages/animal/ui/AnimalPage/AnimalPage'),
		showInMenu: false
	},
	{
		key: 'animalEdit',
		path: '/animals/:id/edit',
		name: 'Редактирование животного',
		shortName: 'Редактирование',
		Icon: PawPrint,
		preload: () => import('../../pages/animal-edit/ui/AnimalEditPage/AnimalEditPage'),
		showInMenu: false
	},
	{
		key: 'postCreate',
		path: '/animals/:id/posts/new',
		name: 'Новый пост',
		shortName: 'Новый пост',
		Icon: MessageSquare,
		preload: () => import('../../pages/post-create/ui/PostCreatePage/PostCreatePage'),
		showInMenu: false
	},
	{
		key: 'guardianships',
		path: '/guardianships',
		name: 'Опекунство',
		shortName: 'Опекунство',
		Icon: Users,
		preload: () => import('../../pages/guardianships/ui/GuardianshipsPage/GuardianshipsPage'),
		showInMenu: true
	},
	{
		key: 'meetings',
		path: '/meetings',
		name: 'Заявки на встречу',
		shortName: 'Встречи',
		Icon: MessageSquare,
		preload: () => import('../../pages/meetings/ui/MeetingsPage/MeetingsPage'),
		showInMenu: true
	},
	{
		key: 'user',
		path: '/user/:id',
		name: 'Пользователь',
		shortName: 'Пользователь',
		Icon: User,
		preload: () => Promise.resolve(),
		showInMenu: false
	},
	{
		key: 'login',
		path: '/login',
		name: 'Вход',
		shortName: 'Вход',
		Icon: LogIn,
		preload: () => import('../../pages/login/ui/LoginPage/LoginPage'),
		showInMenu: false
	}
];

export const ROUTES = adminRoutes.reduce(
	(acc, route) => {
		acc[route.key] = route.path;
		return acc;
	},
	{} as Record<RouteKey, string>
);
