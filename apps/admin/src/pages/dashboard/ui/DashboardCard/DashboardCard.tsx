import { HTMLAttributes, JSX, PropsWithChildren } from 'react';

interface Props extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
	title: string;
}

export const DashboardCard = ({ title, children, className }: Props): JSX.Element => {
	return (
		<div
			className={`bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 shadow-pif ${className}`}>
			<h3 className="text-sm font-bold text-(--color-text-secondary) uppercase tracking-wider mb-4">{title}</h3>
			{children}
		</div>
	);
};
