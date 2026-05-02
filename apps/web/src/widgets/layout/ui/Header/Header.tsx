import { cn } from '../../../../../src/shared/lib/cn';
import { Menu, X } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useVolunteerInvite } from '../../../../features/volunteer-invite';
import { MENU } from '../../../../shared/config/menu';
import { ctaRoutes, ROUTES } from '../../../../shared/config/routes';
import { isRouteActive } from '../../../../shared/lib/route';
import { Logo } from './Logo';

export const Header = (): JSX.Element => {
	const location = useLocation();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { open: openVolunteerInvite } = useVolunteerInvite();

	const isHome = location.pathname === ROUTES.home || location.pathname === '/';

	useEffect(() => {
		setIsMenuOpen(false);
	}, [location.pathname]);

	return (
		<header
			className={`w-full z-50 ${isHome ? 'absolute top-0 left-0 bg-transparent border-none' : 'border-b border-(--color-border-soft) bg-(--color-bg-soft)'} px-3 py-3 sm:px-4 md:px-6`}>
			<div className="mx-auto flex w-full max-w-[1680px] items-center gap-3 md:gap-4">
				<Logo isHome={isHome} />

				<nav className="hidden flex-1 items-center justify-center gap-6 xl:flex">
					{MENU.map((item) => {
						const isActive = isRouteActive(location.pathname, item.path);

						return (
							<Link
								key={item.key}
								to={item.path}
								className={`relative pb-[2px] text-[16px] max-[1440px]:text-[14px] transition-colors ${
									isActive
										? isHome
											? 'font-bold text-(--color-bg-primary)'
											: 'font-bold text-(--color-text-primary)'
										: isHome
											? 'font-semibold text-(--color-bg-primary) hover:opacity-70'
											: 'font-semibold text-(--color-text-primary) hover:opacity-70'
								}`}>
								{item.name}
								{isActive && !isHome && (
									<span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-(--color-brand-accent)" />
								)}
								{isActive && isHome && (
									<span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-white" />
								)}
							</Link>
						);
					})}
				</nav>

				<div className="ml-auto hidden shrink-0 items-center gap-3 xl:flex">
					<Link
						to={ctaRoutes[0].path}
						className={`inline-flex h-11 items-center justify-center rounded-full border px-7 text-[18px] max-[1440px]:px-5 max-[1440px]:text-[16px] font-semibold transition-[transform,box-shadow,background-color,opacity] duration-150 ease-out hover:scale-[1.02] active:scale-[0.99] ${isHome ? 'border-(--color-bg-primary) text-(--color-bg-primary) hover:bg-white/10' : 'border-(--color-border-primary) text-(--color-text-primary) hover:bg-(--color-brand-brown-soft) hover:shadow-[0_2px_10px_rgba(79,61,56,0.14)]'}`}>
						{ctaRoutes[0].label}
					</Link>
					<button
						type="button"
						onClick={() => openVolunteerInvite()}
						className={`inline-flex h-11 items-center justify-center rounded-full px-7 text-[18px] max-[1440px]:px-5 max-[1440px]:text-[16px] font-semibold transition-[transform,box-shadow,background-color,opacity] duration-150 ease-out hover:scale-[1.02] active:scale-[0.99] ${isHome ? 'bg-(--color-bg-primary) text-[#4F3D38] hover:bg-(--color-bg-primary)' : 'bg-(--color-brand-brown) text-(--color-text-on-dark) hover:bg-(--color-brand-brown-strong) hover:shadow-[0_2px_10px_rgba(79,61,56,0.2)]'}`}>
						{ctaRoutes[1].label}
					</button>
				</div>

				<button
					type="button"
					aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
					className={`shrink-0 ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors xl:hidden ${isHome ? 'border-white text-white hover:bg-white/10' : 'border-(--color-border-primary) text-(--color-text-primary) hover:bg-(--color-brand-brown-muted)'}`}
					onClick={() => setIsMenuOpen((prevState) => !prevState)}>
					{isMenuOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</div>

			<div
				className={cn(
					`overflow-hidden border-t transition-all duration-150 xl:hidden border-(--color-border-soft) max-h-0 pt-0 opacity-0`,
					isHome && 'border-white/20 bg-black/65 p-10 rounded-xl pb-5',
					isMenuOpen && 'mt-4 max-h-[420px] pt-4 opacity-100'
				)}>
				<nav className="flex flex-col gap-3">
					{MENU.map((item) => {
						const isActive = isRouteActive(location.pathname, item.path);

						return (
							<Link
								key={item.key}
								to={item.path}
								className={`text-[18px] ${isActive ? (isHome ? 'font-bold text-white' : 'font-bold text-(--color-text-primary)') : isHome ? 'font-semibold text-white opacity-90' : 'font-semibold text-(--color-text-primary) opacity-90'}`}>
								{item.name}
							</Link>
						);
					})}
				</nav>
				<div className="mt-4 flex flex-col gap-3 pb-1 sm:flex-row">
					<Link
						to={ctaRoutes[0].path}
						className={`py-1.5 inline-flex h-11 flex-1 items-center justify-center rounded-full border px-6 text-[18px] font-semibold transition-[box-shadow,background-color,opacity] duration-150 ease-out active:opacity-90 ${isHome ? 'border-white text-white hover:bg-white/10' : 'border-(--color-border-primary) text-(--color-text-primary) hover:bg-(--color-brand-brown-soft) hover:shadow-[0_2px_10px_rgba(79,61,56,0.14)]'}`}>
						{ctaRoutes[0].label}
					</Link>
					<button
						type="button"
						onClick={() => {
							openVolunteerInvite();
							setIsMenuOpen(false);
						}}
						className={`py-1.5 inline-flex h-11 flex-1 items-center justify-center rounded-full px-6 text-[18px] font-semibold transition-[box-shadow,background-color,opacity] duration-150 ease-out active:opacity-90 ${isHome ? 'bg-[#F0E7D6] text-[#4F3D38] hover:bg-white' : 'bg-(--color-brand-brown) text-(--color-text-on-dark) hover:bg-(--color-brand-brown-strong) hover:shadow-[0_2px_10px_rgba(79,61,56,0.2)]'}`}>
						{ctaRoutes[1].label}
					</button>
				</div>
			</div>
		</header>
	);
};
