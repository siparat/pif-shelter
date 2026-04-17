import { type LucideIcon, LayoutDashboard, LogIn, MessageSquare, PawPrint, User, Users } from 'lucide-react';

export type RouteKey = 'dashboard' | 'animals' | 'guardianships' | 'meetings' | 'user' | 'login';

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
