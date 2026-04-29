import { Ban, HeartHandshake, House, Info, List, Mail, PawPrint, WalletCards } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type RouteKey =
	| 'home'
	| 'animals'
	| 'animalDetails'
	| 'donations'
	| 'donationsList'
	| 'cancelSubscription'
	| 'about'
	| 'contacts'
	| 'help'
	| 'campaigns';

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
		showInMenu: false,
		preload: () => import('../../pages/home/ui/HomePage/HomePage')
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
		key: 'campaigns',
		path: '/campaigns',
		name: 'Срочные сборы',
		shortName: 'Сборы',
		Icon: WalletCards,
		showInMenu: true,
		preload: () => import('../../pages/campaigns/ui/CampaignsPage/CampaignsPage')
	},
	{
		key: 'donationsList',
		path: '/donations-list',
		name: 'Список пожертвований',
		shortName: 'Пожертвования',
		Icon: List,
		showInMenu: true,
		preload: () => import('../../pages/donations-list/ui/DonationsListPage/DonationsListPage')
	},
	{
		key: 'cancelSubscription',
		path: '/cancel-subscription',
		name: 'Отмена подписки',
		shortName: 'Отмена подписки',
		Icon: Ban,
		showInMenu: false,
		preload: () => import('../../pages/cancel-subscription/ui/CancelSubscriptionPage/CancelSubscriptionPage')
	},
	{
		key: 'contacts',
		path: '/contacts',
		name: 'Контакты',
		shortName: 'Контакты',
		Icon: Mail,
		showInMenu: true,
		preload: () => import('../../pages/contacts/ui/ContactsPage/ContactsPage')
	},
	{
		key: 'help',
		path: '/help',
		name: 'Помочь делом',
		shortName: 'Помощь',
		Icon: PawPrint,
		showInMenu: false,
		preload: () => import('../../pages/help/ui/HelpPage/HelpPage')
	},
	{
		key: 'donations',
		path: '/donations',
		name: 'Пожертвования',
		shortName: 'Пожертвования',
		Icon: HeartHandshake,
		showInMenu: false,
		preload: () => import('../../pages/donations/ui/DonationsPage/DonationsPage')
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
		path: '/help',
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
