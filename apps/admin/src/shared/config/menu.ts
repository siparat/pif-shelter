import { LayoutDashboard, LucideProps, MessageSquare, PawPrint, Users } from 'lucide-react';
import { ForwardRefExoticComponent } from 'react';

interface MenuItem {
	Icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'>>;
	name: string;
	shortName: string;
	path: string;
}

export const MENU: MenuItem[] = [
	{ path: '/', name: 'Обзор', shortName: 'Обзор', Icon: LayoutDashboard },
	{ path: '/animals', name: 'Животные', shortName: 'Животные', Icon: PawPrint },
	{ path: '/guardianships', name: 'Опекунство', shortName: 'Опекунство', Icon: Users },
	{ path: '/meetings', name: 'Заявки на встречу', shortName: 'Встречи', Icon: MessageSquare }
];
