import { JSX, TextareaHTMLAttributes, useId } from 'react';
import { cn } from '../../lib';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	classNameBlock?: string;
}

export const Textarea = ({ className, classNameBlock, error, label, ...props }: Props): JSX.Element => {
	const id = useId();

	return (
		<div className={cn('flex flex-col gap-2', classNameBlock)}>
			{label && (
				<label htmlFor={id} className="text-sm font-semibold text-(--color-text-primary) px-1">
					{label}
				</label>
			)}
			<textarea
				{...props}
				id={id}
				className={cn(
					'w-full rounded-xl border border-(--color-border) bg-(--color-bg-primary) py-2.5 px-3 text-sm',
					error && 'border-red-400',
					className
				)}
			/>

			{error && <span className="text-xs text-red-400 px-1 font-medium">{error}</span>}
		</div>
	);
};
