import { ChevronDown } from 'lucide-react';
import { JSX, ReactNode, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

type AccordionItemProps = {
	title: string;
	children: ReactNode;
	className?: string;
};

export const AccordionItem = ({ title, children, className }: AccordionItemProps): JSX.Element => {
	const [open, setOpen] = useState(false);
	const bodyRef = useRef<HTMLDivElement>(null);

	return (
		<div
			className={cn(
				'rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) px-4 py-3 shadow-[0_8px_24px_rgba(79,61,56,0.06)] transition-shadow sm:px-5 sm:py-4',
				open && 'shadow-[0_12px_28px_rgba(79,61,56,0.1)]',
				className
			)}>
			<button
				type="button"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				className="flex w-full cursor-pointer items-start gap-3 text-left text-sm font-semibold text-(--color-text-primary) sm:items-center sm:gap-4 sm:text-base">
				<span className="min-w-0 flex-1 pt-0.5 sm:pt-0">{title}</span>
				<ChevronDown
					className={cn(
						'mt-0.5 h-5 w-5 shrink-0 text-(--color-text-secondary) transition-transform duration-300 sm:mt-0',
						open && 'rotate-180'
					)}
					aria-hidden
				/>
			</button>
			<div
				className="grid transition-[grid-template-rows] duration-300 ease-in-out"
				style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
				<div ref={bodyRef} className="overflow-hidden">
					<div className="border-t border-(--color-border-soft) pt-3 mt-3 text-sm leading-relaxed text-(--color-text-secondary) sm:mt-4 sm:pt-4">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};
