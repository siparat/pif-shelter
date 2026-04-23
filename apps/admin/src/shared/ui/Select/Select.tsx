import { ChevronDown } from 'lucide-react';
import {
	type Ref,
	type RefObject,
	JSX,
	SelectHTMLAttributes,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState
} from 'react';
import { cn } from '../../lib';

export interface ISelectOption<T extends string | number = string> {
	value: T;
	label: string;
}

interface Props<T extends string | number> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'ref'> {
	ref?: Ref<HTMLSelectElement>;
	label?: string;
	error?: string;
	options: ISelectOption<T>[];
	placeholder?: string;
	small?: boolean;
}

export const Select = <T extends string | number>({
	label,
	error,
	options,
	className,
	placeholder,
	small,
	ref: refFromProps,
	onClick: onClickFromProps,
	...selectProps
}: Props<T>): JSX.Element => {
	const id = useId();
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const trigger = useRef<HTMLSelectElement | null>(null);

	const mergedRef = useCallback(
		(node: HTMLSelectElement | null) => {
			trigger.current = node;
			if (!refFromProps) {
				return;
			}
			if (typeof refFromProps === 'function') {
				refFromProps(node);
				return;
			}
			(refFromProps as RefObject<HTMLSelectElement | null>).current = node;
		},
		[refFromProps]
	);

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
		window.addEventListener('mousedown', closeContext);
		return () => window.removeEventListener('mousedown', closeContext);
	}, [closeContext]);

	return (
		<div className="flex relative flex-col gap-2">
			{label && (
				<label htmlFor={id} className="text-sm font-semibold text-(--color-text-primary) px-1">
					{label}
				</label>
			)}
			<select
				{...selectProps}
				ref={mergedRef}
				onClick={(event) => {
					setIsOpen((state) => !state);
					onClickFromProps?.(event);
				}}
				id={id}
				className={cn(
					'cursor-pointer w-full appearance-none bg-(--color-bg-primary) border rounded-xl py-3 px-4 pr-10 text-(--color-text-primary) focus:outline-none transition-all',
					small && 'py-2.5 px-3 pr-10 text-sm',
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
			<label
				htmlFor={id}
				className={cn(
					'absolute top-10.5 right-3 pointer-events-none',
					small && 'top-9.5',
					!label && '-translate-y-7'
				)}>
				<ChevronDown className={cn('transition-transform', isOpen && 'rotate-180')} size={24} />
			</label>
			{error && <span className="text-xs text-red-400 px-1 font-medium">{error}</span>}
		</div>
	);
};
