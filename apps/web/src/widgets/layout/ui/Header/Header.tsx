import { Menu, X } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MENU } from '../../../../shared/config/menu';
import { ctaRoutes } from '../../../../shared/config/routes';
import { isRouteActive } from '../../../../shared/lib/route';
import { Logo } from './Logo';

export const Header = (): JSX.Element => {
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		setIsMenuOpen(false);
	}, [location.pathname]);

	return (
		<header className="w-full border-b border-(--color-border-soft) bg-(--color-bg-soft) px-3 py-3 sm:px-4 md:px-6">
			<div className="mx-auto flex w-full max-w-[1680px] items-center gap-3 md:gap-4">
				<Logo />

				<nav className="hidden flex-1 items-center justify-center gap-6 xl:flex">
					{MENU.map((item) => {
						const isActive = isRouteActive(location.pathname, item.path);

						return (
							<Link
								key={item.key}
								to={item.path}
								className={`relative pb-[2px] text-[16px] max-[1440px]:text-[14px] transition-colors ${
									isActive
										? 'font-bold text-(--color-text-primary)'
										: 'font-semibold text-(--color-text-primary) hover:opacity-70'
								}`}>
								{item.name}
								{isActive && (
									<span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-(--color-brand-accent)" />
								)}
							</Link>
						);
					})}
				</nav>

				<div className="ml-auto hidden shrink-0 items-center gap-3 xl:flex">
					<Link
						to={ctaRoutes[0].path}
						className="inline-flex h-11 items-center justify-center rounded-full border border-(--color-border-primary) px-7 text-[18px] max-[1440px]:px-5 max-[1440px]:text-[16px] font-semibold text-(--color-text-primary) transition-[transform,box-shadow,background-color,opacity] duration-150 ease-out hover:scale-[1.02] hover:bg-(--color-brand-brown-soft) hover:shadow-[0_2px_10px_rgba(79,61,56,0.14)] active:scale-[0.99]">
						{ctaRoutes[0].label}
					</Link>
					<Link
						to={ctaRoutes[1].path}
						className="inline-flex h-11 items-center justify-center rounded-full bg-(--color-brand-brown) px-7 text-[18px] max-[1440px]:px-5 max-[1440px]:text-[16px] font-semibold text-(--color-text-on-dark) transition-[transform,box-shadow,background-color,opacity] duration-150 ease-out hover:scale-[1.02] hover:bg-(--color-brand-brown-strong) hover:shadow-[0_2px_10px_rgba(79,61,56,0.2)] active:scale-[0.99]">
						{ctaRoutes[1].label}
					</Link>
				</div>

				<button
					type="button"
					aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
					className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-(--color-border-primary) text-(--color-text-primary) transition-colors hover:bg-(--color-brand-brown-muted) xl:hidden"
					onClick={() => setIsMenuOpen((prevState) => !prevState)}>
					{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</div>

			<div
				className={`overflow-hidden border-t border-(--color-border-soft) transition-all duration-150 xl:hidden ${
					isMenuOpen ? 'mt-4 max-h-[420px] pt-4 opacity-100' : 'max-h-0 pt-0 opacity-0'
				}`}>
				<nav className="flex flex-col gap-3">
					{MENU.map((item) => {
						const isActive = isRouteActive(location.pathname, item.path);

						return (
							<Link
								key={item.key}
								to={item.path}
								className={`text-[18px] ${isActive ? 'font-bold text-(--color-text-primary)' : 'font-semibold text-(--color-text-primary) opacity-90'}`}>
								{item.name}
							</Link>
						);
					})}
				</nav>
				<div className="mt-4 flex flex-col gap-3 pb-1 sm:flex-row">
					<Link
						to={ctaRoutes[0].path}
						className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-(--color-border-primary) px-6 text-[18px] font-semibold text-(--color-text-primary) transition-[box-shadow,background-color,opacity] duration-150 ease-out hover:bg-(--color-brand-brown-soft) hover:shadow-[0_2px_10px_rgba(79,61,56,0.14)] active:opacity-90">
						{ctaRoutes[0].label}
					</Link>
					<Link
						to={ctaRoutes[1].path}
						className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-(--color-brand-brown) px-6 text-[18px] font-semibold text-(--color-text-on-dark) transition-[box-shadow,background-color,opacity] duration-150 ease-out hover:bg-(--color-brand-brown-strong) hover:shadow-[0_2px_10px_rgba(79,61,56,0.2)] active:opacity-90">
						{ctaRoutes[1].label}
					</Link>
				</div>
			</div>
		</header>
	);
};
