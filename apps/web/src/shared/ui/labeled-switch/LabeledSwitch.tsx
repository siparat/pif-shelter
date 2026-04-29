import { JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type LabeledSwitchProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	title: ReactNode;
	description?: ReactNode;
	className?: string;
};

export const LabeledSwitch = ({
	checked,
	onCheckedChange,
	title,
	description,
	className
}: LabeledSwitchProps): JSX.Element => {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				'flex w-full cursor-pointer flex-col gap-3 rounded-2xl border border-(--color-border-soft) bg-(--color-brand-brown-soft) px-4 py-3 text-left transition-colors hover:bg-(--color-brand-brown-muted)/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand-accent) sm:flex-row sm:items-center sm:justify-between sm:gap-4',
				className
			)}>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="text-sm font-bold text-(--color-text-primary)">{title}</span>
				{description ? <span className="text-xs text-(--color-text-secondary)">{description}</span> : null}
			</div>
			<div className="flex w-full shrink-0 justify-end sm:w-auto">
				<span
					className={cn(
						'pointer-events-none relative h-9 w-[52px] shrink-0 rounded-full transition-colors duration-200',
						checked ? 'bg-(--color-brand-brown)' : 'bg-(--color-text-secondary)/40'
					)}
					aria-hidden>
					<span
						className={cn(
							'absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow transition-transform duration-200',
							checked ? 'translate-x-4' : 'translate-x-0'
						)}
					/>
				</span>
			</div>
		</button>
	);
};
