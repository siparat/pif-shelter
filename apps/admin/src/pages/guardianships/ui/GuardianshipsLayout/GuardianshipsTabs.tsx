import { JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCanAccessAllGuardianships } from '../../../../entities/guardianship';
import { ROUTES } from '../../../../shared/config';
import { cn, isRouteActive } from '../../../../shared/lib';

interface TabDefinition {
	to: string;
	label: string;
}

export const GuardianshipsTabs = (): JSX.Element => {
	const location = useLocation();
	const canAccessAll = useCanAccessAllGuardianships();

	const tabs: TabDefinition[] = [
		{ to: ROUTES.guardianshipsMy, label: 'Мои подопечные' },
		...(canAccessAll ? [{ to: ROUTES.guardianshipsAll, label: 'Все опекунства' }] : [])
	];

	return (
		<nav className="flex gap-2 border-b border-(--color-border)">
			{tabs.map((tab) => {
				const active = isRouteActive(location.pathname, tab.to);
				return (
					<Link
						key={tab.to}
						to={tab.to}
						className={cn(
							'-mb-px px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors',
							active
								? 'border-(--color-brand-orange) text-(--color-text-primary)'
								: 'border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)'
						)}>
						{tab.label}
					</Link>
				);
			})}
		</nav>
	);
};
