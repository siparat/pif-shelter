import { JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ChoiceChip<T> = {
	value: T;
	label: ReactNode;
};

export type ChoiceChipGroupProps<T> = {
	items: ChoiceChip<T>[];
	selectedValue: T;
	onSelect: (value: T) => void;
	equals?: (a: T, b: T) => boolean;
	className?: string;
};

export const ChoiceChipGroup = <T,>({
	items,
	selectedValue,
	onSelect,
	equals = (a, b) => Object.is(a, b),
	className
}: ChoiceChipGroupProps<T>): JSX.Element => {
	return (
		<div className={cn('grid grid-cols-2 gap-2 sm:flex sm:flex-wrap', className)}>
			{items.map((item, index) => {
				const active = equals(selectedValue, item.value);
				return (
					<button
						key={`choice-chip-${index}`}
						type="button"
						onClick={() => onSelect(item.value)}
						className={cn(
							'flex h-11 min-h-11 w-full min-w-0 items-center justify-center rounded-full px-3 text-xs font-bold transition-transform sm:w-auto sm:min-w-18 sm:px-4 sm:text-sm',
							active
								? 'scale-[1.02] bg-(--color-brand-accent) text-white shadow-md'
								: 'border border-(--color-border-soft) bg-(--color-surface-secondary) text-(--color-text-primary) hover:border-(--color-brand-brown-muted)'
						)}>
						{item.label}
					</button>
				);
			})}
		</div>
	);
};
