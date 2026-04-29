import { HTMLAttributes, JSX } from 'react';
import { cn } from '../../lib/cn';

type GlassCardProps = HTMLAttributes<HTMLDivElement>;

export const GlassCard = ({ className, children, ...rest }: GlassCardProps): JSX.Element => (
	<div
		{...rest}
		className={cn(
			'relative overflow-hidden rounded-2xl border border-white/10 bg-[#fe8651]/[0.12] backdrop-blur-md',
			'shadow-[inset_0_1px_0_rgba(240,231,214,0.15),0_8px_24px_rgba(0,0,0,0.25)]',
			'before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[0.08] before:to-transparent',
			className
		)}>
		{children}
	</div>
);
