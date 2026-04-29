import { JSX } from 'react';

interface StatCardProps {
	value: string;
	description: string;
	label: string;
	className?: string;
}

export const StatCard = ({ value, description, label, className }: StatCardProps): JSX.Element => (
	<div className={className}>
		<span className="text-3xl font-medium leading-none sm:text-4xl">{value}</span>
		<span className="text-[13px] font-semibold leading-snug opacity-80">{description}</span>
		<span className="mt-auto text-[15px] font-bold">{label}</span>
	</div>
);
