import { JSX } from 'react';
import { cn } from '../../../shared/lib/cn';

interface FilterToggleProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export const FilterToggle = ({ label, checked, onChange }: FilterToggleProps): JSX.Element => (
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		onClick={() => onChange(!checked)}
		className={cn(
			'group inline-flex h-10 items-center gap-2.5 rounded-full px-3.5 pr-4 text-[13px] font-semibold transition-colors duration-150',
			checked
				? 'bg-(--color-brand-accent)/15 text-(--color-text-primary)'
				: 'bg-(--color-brand-brown-soft) text-(--color-text-secondary) hover:bg-(--color-brand-brown-muted)'
		)}>
		<span
			className={cn(
				'relative h-5 w-9 rounded-full transition-colors duration-150',
				checked ? 'bg-(--color-brand-accent)' : 'bg-(--color-brand-brown-muted)'
			)}>
			<span
				className={cn(
					'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-150',
					checked ? 'left-[18px]' : 'left-0.5'
				)}
			/>
		</span>
		{label}
	</button>
);
