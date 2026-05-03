import { ArrowRight, PawPrint } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../../shared/config/routes';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';

export const GuardianshipCta = (): JSX.Element => {
	const { ref, inView } = useInView({ threshold: 0.2 });

	const decorations = [
		{ top: '12%', left: '8%', rotate: -18, size: 70, delay: '0s' },
		{ top: '70%', left: '14%', rotate: 22, size: 56, delay: '1.4s' },
		{ top: '20%', left: '82%', rotate: 14, size: 88, delay: '0.6s' },
		{ top: '74%', left: '78%', rotate: -10, size: 64, delay: '2s' },
		{ top: '46%', left: '50%', rotate: 6, size: 100, delay: '1s' }
	];

	return (
		<section
			ref={ref as React.RefObject<HTMLElement>}
			className="relative overflow-hidden rounded-4xl bg-(--color-brand-accent) py-24 lg:py-32">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-25"
				style={{
					background:
						'radial-gradient(40% 40% at 20% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%), radial-gradient(50% 50% at 80% 100%, rgba(79,61,56,0.25) 0%, rgba(79,61,56,0) 70%)'
				}}
			/>
			<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
				{decorations.map((deco, index) => (
					<PawPrint
						key={index}
						className="animate-float absolute text-(--color-text-inverse)/15"
						style={{
							top: deco.top,
							left: deco.left,
							width: deco.size,
							height: deco.size,
							transform: `rotate(${deco.rotate}deg)`,
							animationDelay: deco.delay
						}}
						strokeWidth={1.4}
					/>
				))}
			</div>

			<div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-8 px-4 text-center md:px-12">
				<h2
					className={cn(
						'max-w-[820px] font-black leading-[1.05] tracking-tight text-(--color-text-inverse) transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
					)}
					style={{ fontSize: 'clamp(2.25rem, 4.4vw, 3.5rem)' }}>
					Готов изменить чью-то жизнь?
				</h2>
				<p
					className={cn(
						'max-w-[620px] text-lg leading-relaxed text-(--color-text-inverse)/90 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
					)}
					style={{ transitionDelay: '120ms' }}>
					Сотни хвостиков ждут своего человека. Может, именно твоего.
				</p>
				<div
					className={cn(
						'flex flex-col items-center gap-5 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] sm:flex-row sm:gap-8',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
					)}
					style={{ transitionDelay: '240ms' }}>
					<Link
						to={ROUTES.animals}
						className="group inline-flex items-center gap-2 rounded-full bg-(--color-surface-secondary) px-8 py-4 text-base font-bold text-(--color-brand-brown-strong) shadow-[0_18px_38px_rgba(62,47,42,0.25)] transition-transform hover:-translate-y-0.5">
						Выбрать подопечного
						<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
					</Link>
					<Link
						to={ROUTES.contacts}
						className="text-base font-semibold text-(--color-text-inverse) underline-offset-4 transition-opacity hover:underline hover:opacity-90">
						Сначала пообщаться
					</Link>
				</div>
			</div>
		</section>
	);
};
