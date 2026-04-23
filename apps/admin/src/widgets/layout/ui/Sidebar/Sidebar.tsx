import { JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU } from '../../../../shared/config';
import { cn, isRouteActive } from '../../../../shared/lib';
import { Logo } from '../Logo/Logo';
import { LogoutButton } from './LogoutButton';

export const Sidebar = (): JSX.Element => {
	const location = useLocation();

	return (
		<aside className="w-72 h-screen hidden md:flex flex-col bg-(--color-bg-secondary) border-r border-(--color-border) sticky top-0">
			<div className="p-8">
				<Logo />
			</div>

			<div className="flex-1 p-6 flex flex-col gap-2">
				<p className="text-[10px] font-bold text-(--color-text-secondary) uppercase tracking-[0.2em] px-4 mb-2 opacity-50">
					Меню управления
				</p>

				{MENU.map(({ Icon, name, path, preload }) => {
					const active = isRouteActive(location.pathname, path);
					return (
						<Link
							key={path}
							to={path}
							onMouseEnter={() => void preload()}
							onFocus={() => void preload()}
							className={cn(
								'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group',
								active
									? 'bg-(--color-brand-orange) text-white shadow-lg shadow-(--color-brand-orange)/20'
									: 'text-(--color-text-secondary) hover:bg-(--color-bg-primary) hover:text-(--color-text-primary)'
							)}>
							<Icon
								size={20}
								className={
									active ? 'text-white' : 'group-hover:text-(--color-brand-orange) transition-colors'
								}
							/>
							<span>{name}</span>
						</Link>
					);
				})}
			</div>

			<div className="p-6 border-t border-(--color-border)">
				<LogoutButton />
			</div>
		</aside>
	);
};
