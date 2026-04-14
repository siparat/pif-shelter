import { Link } from 'lucide-react';
import { JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { MENU } from '../../../../shared/config';
import { cn } from '../../../../shared/lib';

export const BottomNav = (): JSX.Element => {
	const location = useLocation();

	return (
		<nav className="fixed bottom-0 left-0 right-0 h-20 bg-(--color-bg-secondary)/80 backdrop-blur-xl border-t border-(--color-border) flex items-center justify-around md:hidden z-50">
			{MENU.map(({ Icon, shortName, path }) => (
				<Link
					to={path}
					className={cn(
						'flex flex-col items-center gap-1 text-(--color-text-secondary)',
						location.pathname === path && 'text-(--color-brand-orange)'
					)}>
					<Icon size={24} />
					<span className="text-[10px] font-bold uppercase">{shortName}</span>
				</Link>
			))}
		</nav>
	);
};
