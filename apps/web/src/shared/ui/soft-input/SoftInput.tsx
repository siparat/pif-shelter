import { ComponentProps, forwardRef, JSX } from 'react';
import { cn } from '../../lib/cn';

export type SoftInputProps = ComponentProps<'input'>;

export const SoftInput = forwardRef<HTMLInputElement, SoftInputProps>(
	({ className, ...props }, ref): JSX.Element => (
		<input
			ref={ref}
			className={cn(
				'h-12 w-full rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 text-base font-semibold text-(--color-text-primary) outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-(--color-brand-accent) disabled:cursor-not-allowed disabled:opacity-60',
				className
			)}
			{...props}
		/>
	)
);

SoftInput.displayName = 'SoftInput';
