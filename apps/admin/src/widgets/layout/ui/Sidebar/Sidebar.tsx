import { LayoutDashboard, LogOut, MessageSquare, PawPrint, Users } from 'lucide-react';
import { FC, JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItemProps {
	to: string;
	icon: any;
	label: string;
	isActive: boolean;
}

const NavItem: FC<NavItemProps> = ({ to, icon: Icon, label, isActive }) => (
	<Link
		to={to}
		className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
			isActive
				? 'bg-(--color-brand-orange) text-white shadow-lg shadow-(--color-brand-orange)/20'
				: 'text-(--color-text-secondary) hover:bg-(--color-bg-primary) hover:text-(--color-text-primary)'
		}`}>
		<Icon
			size={20}
			className={isActive ? 'text-white' : 'group-hover:text-(--color-brand-orange) transition-colors'}
		/>
		{label}
	</Link>
);

export const Sidebar = (): JSX.Element => {
	const location = useLocation();

	return (
		<aside className="w-72 h-screen hidden md:flex flex-col bg-(--color-bg-secondary) border-r border-(--color-border) sticky top-0">
			<div className="p-8">
				<div className="flex items-center gap-3">
					<span className="text-xl font-bold tracking-tight">Админ панель</span>
				</div>
			</div>

			<div className="flex-1 p-6 flex flex-col gap-2">
				<p className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-[0.2em] px-4 mb-2 opacity-50">
					Меню управления
				</p>

				<NavItem to="/" icon={LayoutDashboard} label="Обзор" isActive={location.pathname === '/'} />
				<NavItem
					to="/animals"
					icon={PawPrint}
					label="Животные"
					isActive={location.pathname.startsWith('/animals')}
				/>
				<NavItem
					to="/guardianship"
					icon={Users}
					label="Опекунство"
					isActive={location.pathname.startsWith('/guardianship')}
				/>
				<NavItem
					to="/meeting-requests"
					icon={MessageSquare}
					label="Заявки на встречу"
					isActive={location.pathname.startsWith('/meeting-requests')}
				/>
			</div>

			<div className="p-6 border-t border-(--color-border)">
				<button
					onClick={() => {
						localStorage.removeItem('token');
						window.location.href = '/login';
					}}
					className="flex cursor-pointer items-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-400 hover:bg-red-400/10 font-bold transition-colors group">
					<LogOut size={20} />
					Выйти
				</button>
			</div>
		</aside>
	);
};
