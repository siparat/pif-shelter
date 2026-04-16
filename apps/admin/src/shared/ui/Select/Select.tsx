import { ChevronDown } from 'lucide-react';
import { JSX, SelectHTMLAttributes, useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../lib';

export interface ISelectOption<T extends string = string> {
	value: T;
	label: string;
}

interface Props<T extends string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
	label?: string;
	error?: string;
	options: ISelectOption<T>[];
	placeholder?: string;
}

export const Select = <T extends string>({
	label,
	error,
	options,
	className,
	placeholder,
	...props
}: Props<T>): JSX.Element => {
	const id = useId();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const trigger = useRef<HTMLSelectElement>(null);

	const closeContext = useCallback(
		(e: MouseEvent) => {
			if (!isOpen) {
				return;
			}
			if (!(e.target instanceof Node)) {
				return;
			}
			if (!trigger.current) {
				return;
			}
			if (trigger.current.contains(e.target)) {
				return;
			}
			setIsOpen(false);
		},
		[isOpen]
	);

	useEffect(() => {
		document.addEventListener('mousedown', closeContext);
		return () => document.removeEventListener('mousedown', closeContext);
	}, [closeContext]);

	return (
		<div className="flex relative flex-col gap-2">
			{label && (
				<label htmlFor={id} className="text-sm font-semibold text-(--color-text-primary) px-1">
					{label}
				</label>
			)}
			<select
				{...props}
				ref={trigger}
				onClick={() => setIsOpen((state) => !state)}
				id={id}
				className={cn(
					'cursor-pointer w-full appearance-none bg-(--color-bg-primary) border rounded-xl py-3 px-4 text-(--color-text-primary) focus:outline-none transition-all',
					error ? 'border-red-400' : 'border-(--color-border) focus:border-(--color-brand-orange)',
					className
				)}>
				{placeholder && <option value="">{placeholder}</option>}
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<label htmlFor={id} className="absolute bottom-3 right-3 pointer-events-none">
				<ChevronDown className={cn('transition-transform', isOpen && 'rotate-180')} size={24} />
			</label>
			{error && <span className="text-xs text-red-400 px-1 font-medium">{error}</span>}
		</div>
	);
};
