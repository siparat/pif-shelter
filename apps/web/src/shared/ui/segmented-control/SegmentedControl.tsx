import { JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type SegmentedControlItem<T extends string> = {
	value: T;
	label: ReactNode;
	tabId?: string;
};

export type SegmentedControlProps<T extends string> = {
	value: T;
	onValueChange: (value: T) => void;
	items: SegmentedControlItem<T>[];
	'aria-label': string;
	trackClassName?: string;
	size?: 'compact' | 'comfortable';
};

export const SegmentedControl = <T extends string>({
	value,
	onValueChange,
	items,
	'aria-label': ariaLabel,
	trackClassName,
	size = 'compact'
}: SegmentedControlProps<T>): JSX.Element => {
	return (
		<div
			className={cn(
				'flex w-full min-w-0 items-stretch rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) p-1',
				trackClassName
			)}
			role="tablist"
			aria-label={ariaLabel}>
			{items.map((item) => {
				const isActive = value === item.value;
				return (
					<button
						key={item.value}
						type="button"
						role="tab"
						id={item.tabId}
						aria-selected={isActive}
						onClick={() => onValueChange(item.value)}
						className={cn(
							'inline-flex min-h-full min-w-0 flex-1 items-center justify-center rounded-full font-bold transition-all duration-200',
							size === 'comfortable'
								? 'min-h-11 gap-1 px-1.5 py-2 text-[11px] leading-snug sm:h-12 sm:gap-2 sm:px-3 sm:py-0 sm:text-sm'
								: 'h-auto min-h-11 gap-1 px-1.5 py-2 text-xs sm:h-11 sm:gap-2 sm:px-3 sm:py-0 sm:text-sm',
							isActive
								? 'bg-(--color-brand-brown) text-(--color-text-on-dark) shadow'
								: 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
						)}>
						{item.label}
					</button>
				);
			})}
		</div>
	);
};
