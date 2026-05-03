import { CSSProperties, JSX, ReactNode } from 'react';
import { cn } from '../../../../shared/lib/cn';
import { useCountUp } from '../../../../shared/lib/use-count-up';

interface StatCardProps {
	value: string;
	description: string;
	label: ReactNode;
	className?: string;
	textClassName?: string;
	inView?: boolean;
	delay?: number;
}

export const StatCard = ({
	value,
	description,
	label,
	className,
	textClassName,
	inView = false,
	delay = 0
}: StatCardProps): JSX.Element => {
	const animated = useCountUp(value, inView);

	const style: CSSProperties = {
		opacity: inView ? 1 : 0,
		transform: inView ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
		transition: `opacity 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
	};

	return (
		<div
			style={style}
			className={cn('rounded-[32px] p-8 md:p-8 flex flex-col justify-between min-h-[260px]', className)}>
			<div className="flex justify-between items-start gap-4">
				<span
					className={cn(
						'text-[40px] lg:text-[46px] font-bold whitespace-nowrap leading-none',
						textClassName
					)}>
					{animated}
				</span>
				<p className={cn('text-sm font-medium leading-tight max-w-[130px]', textClassName)}>{description}</p>
			</div>
			<span className={cn('text-[22px] lg:text-[24px] font-semibold leading-tight mt-10', textClassName)}>
				{label}
			</span>
		</div>
	);
};
