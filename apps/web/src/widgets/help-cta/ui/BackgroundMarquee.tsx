import { JSX } from 'react';
import { cn } from '../../../shared/lib/cn';
import { helpOptions } from '../model/options';

const outlineStyle = {
	WebkitTextStroke: '1.5px rgba(240, 231, 214, 0.18)',
	color: 'transparent'
} as const;

export const BackgroundMarquee = (): JSX.Element => (
	<div className="font-[Arial] absolute inset-0 overflow-hidden pointer-events-none select-none flex flex-col justify-around py-8 pt-[10%]">
		{helpOptions.map(({ title, id }, i) => (
			<div
				key={id}
				className={cn(
					'flex w-max',
					i % 2 ? 'animate-[marquee-reverse_60s_linear_infinite]' : 'animate-[marquee_60s_linear_infinite]'
				)}>
				<span
					style={outlineStyle}
					className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
					{(title.toUpperCase() + '   ·   ').repeat(5)}
				</span>
				<span
					style={outlineStyle}
					className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
					{(title.toUpperCase() + '   ·   ').repeat(5)}
				</span>
			</div>
		))}
	</div>
);
