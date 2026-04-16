import { HTMLAttributes, JSX } from 'react';
import { cn } from '../../lib';

interface Props extends HTMLAttributes<HTMLDivElement> {
	title: string;
	subtitle?: string;
	children?: React.ReactNode;
}

export const PageTitle = ({ title, subtitle, children, className, ...props }: Props): JSX.Element => {
	return (
		<div {...props} className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-3', className)}>
			<div>
				<h1 className="text-3xl font-bold tracking-tight">{title}</h1>
				{subtitle && <p className="text-(--color-text-secondary)">{subtitle}</p>}
			</div>

			{children}
		</div>
	);
};
