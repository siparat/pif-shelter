import { clsx } from 'clsx';
import { CSSProperties, JSX, ReactNode } from 'react';

interface FeatureCardProps {
	title: string;
	description: string;
	imageContent?: ReactNode;
	className?: string;
	textClassName?: string;
	titleClassName?: string;
	inView?: boolean;
	delay?: number;
	translateX?: number;
	translateY?: number;
}

export const FeatureCard = ({
	title,
	description,
	imageContent,
	className,
	textClassName,
	titleClassName,
	inView = false,
	delay = 0,
	translateX = 0,
	translateY = 40
}: FeatureCardProps): JSX.Element => {
	const style: CSSProperties = {
		opacity: inView ? 1 : 0,
		transform: inView ? 'translate(0, 0) scale(1)' : `translate(${translateX}px, ${translateY}px) scale(0.97)`,
		transition: `opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`
	};

	return (
		<div
			style={style}
			className={clsx('relative overflow-hidden rounded-[32px] p-8 flex flex-col min-h-[250px]', className)}>
			<div className={clsx('relative z-10 max-w-[65%] lg:max-w-[55%]', textClassName)}>
				<h3 className={clsx('text-xl md:text-2xl font-bold mb-4', titleClassName)}>{title}</h3>
				<p className="text-base md:text-md font-medium leading-snug opacity-90">{description}</p>
			</div>
			{imageContent}
		</div>
	);
};
