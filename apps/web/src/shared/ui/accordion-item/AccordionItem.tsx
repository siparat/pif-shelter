import { ChevronDown } from 'lucide-react';
import { JSX, ReactNode } from 'react';
import { cn } from '../../lib/cn';

type AccordionItemProps = {
	title: string;
	children: ReactNode;
	className?: string;
};

export const AccordionItem = ({ title, children, className }: AccordionItemProps): JSX.Element => {
	return (
		<details
			className={cn(
				'group rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) px-4 py-3 shadow-[0_8px_24px_rgba(79,61,56,0.06)] transition-shadow sm:px-5 sm:py-4 open:shadow-[0_12px_28px_rgba(79,61,56,0.1)]',
				className
			)}>
			<summary className="flex cursor-pointer list-none items-start gap-3 text-left text-sm font-semibold text-(--color-text-primary) marker:content-none sm:items-center sm:gap-4 sm:text-base [&::-webkit-details-marker]:hidden">
				<span className="min-w-0 flex-1 pt-0.5 sm:pt-0">{title}</span>
				<ChevronDown
					className="mt-0.5 h-5 w-5 shrink-0 text-(--color-text-secondary) transition-transform duration-200 group-open:rotate-180 sm:mt-0"
					aria-hidden
				/>
			</summary>
			<div className="mt-3 border-t border-(--color-border-soft) pt-3 text-sm leading-relaxed text-(--color-text-secondary) sm:mt-4 sm:pt-4">
				{children}
			</div>
		</details>
	);
};
