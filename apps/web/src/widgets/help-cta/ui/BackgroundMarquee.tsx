import { JSX } from 'react';
import { helpOptions } from '../model/options';

const phrase = helpOptions.map((o) => o.title.toUpperCase()).join('   ·   ');

const outlineStyle = {
	WebkitTextStroke: '1.5px rgba(240, 231, 214, 0.18)',
	color: 'transparent'
} as const;

export const BackgroundMarquee = (): JSX.Element => (
	<div className="font-[Arial] absolute inset-0 overflow-hidden pointer-events-none select-none flex flex-col justify-around py-8 pt-[10%]">
		<div className="flex w-max animate-[marquee-reverse_60s_linear_infinite]">
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
		</div>

		<div className="flex w-max animate-[marquee-reverse_60s_linear_infinite]">
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
		</div>

		<div className="flex w-max animate-[marquee_80s_linear_infinite]">
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
		</div>

		<div className="flex w-max animate-[marquee_80s_linear_infinite]">
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
		</div>

		<div className="flex w-max animate-[marquee_80s_linear_infinite]">
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
		</div>

		<div className="flex w-max animate-[marquee-reverse_70s_linear_infinite]">
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
			<span
				style={outlineStyle}
				className="font-black text-[clamp(60px,9vw,140px)] tracking-tight whitespace-nowrap pr-12">
				{phrase}
			</span>
		</div>
	</div>
);
