import { CSSProperties, JSX, useEffect, useRef, useState } from 'react';

interface HelpAnimalCircleProps {
	src: string;
	alt: string;
	delay: number;
	floatDelay?: number;
}

export const HelpAnimalCircle = ({ src, alt, delay, floatDelay = 0 }: HelpAnimalCircleProps): JSX.Element => {
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const wrapperStyle: CSSProperties = {
		opacity: inView ? 1 : 0,
		transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.85)',
		transition: `opacity 0.9s cubic-bezier(0.34, 1.5, 0.64, 1) ${delay}ms, transform 0.9s cubic-bezier(0.34, 1.5, 0.64, 1) ${delay}ms`
	};

	const floatStyle: CSSProperties = {
		animation: 'float 7s ease-in-out infinite',
		animationDelay: `${floatDelay}ms`
	};

	return (
		<div ref={ref} style={wrapperStyle} className="relative aspect-square flex items-center justify-center">
			<div
				style={floatStyle}
				className="relative w-full h-full m-2 rounded-full overflow-hidden ring-4 ring-white/10 shadow-[0_20px_48px_rgba(0,0,0,0.4)] hover:ring-(--color-brand-accent)/40 transition-all duration-500 hover:scale-105">
				<img src={src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
				<div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15 pointer-events-none" />
			</div>
		</div>
	);
};
