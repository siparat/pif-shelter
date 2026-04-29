import { JSX } from 'react';
import { cn } from '../../../shared/lib/cn';

export type FilterChipOption<T extends string> = {
	value: T;
	label: string;
};

interface FilterChipGroupProps<T extends string> {
	label: string;
	options: FilterChipOption<T>[];
	value?: T;
	onChange: (value?: T) => void;
	anyLabel?: string;
}

export const FilterChipGroup = <T extends string>({
	label,
	options,
	value,
	onChange,
	anyLabel = 'Любой'
}: FilterChipGroupProps<T>): JSX.Element => (
	<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
		<span className="shrink-0 text-[12px] font-bold uppercase tracking-[0.16em] text-(--color-text-secondary) sm:w-20">
			{label}
		</span>
		<div className="flex flex-wrap gap-1.5">
			<Chip active={value === undefined} onClick={() => onChange(undefined)}>
				{anyLabel}
			</Chip>
			{options.map((option) => (
				<Chip key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>
					{option.label}
				</Chip>
			))}
		</div>
	</div>
);

const Chip = ({
	active,
	onClick,
	children
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}): JSX.Element => (
	<button
		type="button"
		aria-pressed={active}
		onClick={onClick}
		className={cn(
			'inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition-colors duration-150',
			active
				? 'bg-(--color-brand-brown) text-(--color-text-on-dark)'
				: 'bg-(--color-brand-brown-soft) text-(--color-text-primary) hover:bg-(--color-brand-brown-muted)'
		)}>
		{children}
	</button>
);
