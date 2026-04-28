import { HeartHandshake, House, Info, Mail, PawPrint, WalletCards } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type RouteKey = 'home' | 'animals' | 'animalDetails' | 'donations' | 'about' | 'contacts';

export type WebRoute = {
	key: RouteKey;
	path: string;
	name: string;
	shortName: string;
	Icon: LucideIcon;
	showInMenu: boolean;
	preload: () => Promise<unknown>;
};

export const webRoutes: WebRoute[] = [
	{
		key: 'home',
		path: '/',
		name: 'Главная',
		shortName: 'Главная',
		Icon: House,
		showInMenu: true,
		preload: () => import('../../pages/home/ui/HomePage/HomePage')
	},
	{
		key: 'animals',
		path: '/animals',
		name: 'Животные',
		shortName: 'Животные',
		Icon: PawPrint,
		showInMenu: true,
		preload: () => import('../../pages/animals/ui/AnimalsPage/AnimalsPage')
	},
	{
		key: 'animalDetails',
		path: '/animals/:slug',
		name: 'Карточка животного',
		shortName: 'Карточка',
		Icon: PawPrint,
		showInMenu: false,
		preload: () => import('../../pages/animal/ui/AnimalPage/AnimalPage')
	},
	{
		key: 'donations',
		path: '/donations',
		name: 'Сборы',
		shortName: 'Сборы',
		Icon: WalletCards,
		showInMenu: true,
		preload: () => import('../../pages/donations/ui/DonationsPage/DonationsPage')
	},
	{
		key: 'about',
		path: '/about',
		name: 'О приюте',
		shortName: 'О приюте',
		Icon: Info,
		showInMenu: true,
		preload: () => import('../../pages/about/ui/AboutPage/AboutPage')
	},
	{
		key: 'contacts',
		path: '/contacts',
		name: 'Контакты',
		shortName: 'Контакты',
		Icon: Mail,
		showInMenu: true,
		preload: () => import('../../pages/contacts/ui/ContactsPage/ContactsPage')
	}
];

export const ctaRoutes = [
	{
		label: 'Пожертвовать',
		path: '/donations',
		Icon: HeartHandshake
	},
	{
		label: 'Помочь делом',
		path: '/contacts',
		Icon: PawPrint
	}
];

export const ROUTES = webRoutes.reduce(
	(acc, route) => {
		acc[route.key] = route.path;
		return acc;
	},
	{} as Record<RouteKey, string>
);
