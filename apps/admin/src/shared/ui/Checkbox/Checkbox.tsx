import { InputHTMLAttributes, JSX } from 'react';
import { cn } from '../../lib';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
	label: string;
	description?: string;
}

export const Checkbox = ({ label, description, className, ...props }: Props): JSX.Element => {
	return (
		<label
			className={cn(
				'flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3 cursor-pointer',
				className
			)}>
			<input
				{...props}
				type="checkbox"
				className="mt-1 h-4 w-4 cursor-pointer accent-(--color-brand-orange) rounded border-(--color-border)"
			/>
			<span className="flex flex-col">
				<span className="text-sm font-medium">{label}</span>
				{description && <span className="text-xs text-(--color-text-secondary)">{description}</span>}
			</span>
		</label>
	);
};
