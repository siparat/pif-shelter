import { HeartHandshake } from 'lucide-react';
import { JSX } from 'react';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';

export const PricingSection = (): JSX.Element => {
	const { ref, inView } = useInView({ threshold: 0.15 });

	return (
		<section
			ref={ref as React.RefObject<HTMLElement>}
			className="relative overflow-hidden rounded-4xl bg-(--color-surface-strong) py-20 lg:py-28">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-50"
				style={{
					background:
						'radial-gradient(50% 50% at 80% 0%, rgba(254,134,81,0.18) 0%, rgba(254,134,81,0) 70%), radial-gradient(40% 40% at 0% 100%, rgba(234,215,191,0.12) 0%, rgba(234,215,191,0) 70%)'
				}}
			/>
			<div className="relative mx-auto max-w-[1280px] px-4 md:px-12">
				<div className="mb-14 max-w-[760px]">
					<h2
						className={cn(
							'font-black leading-tight tracking-tight text-(--color-text-on-dark) transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
							inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
						)}
						style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}>
						Сколько это стоит
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
					<div
						className={cn(
							'flex flex-col gap-6 rounded-3xl border border-(--color-text-on-dark)/15 bg-(--color-text-on-dark)/5 p-8 backdrop-blur transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] sm:p-10',
							inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
						)}
						style={{ transitionDelay: '140ms' }}>
						<span className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-text-inverse-soft)">
							Фиксированная сумма
						</span>
						<div className="flex items-baseline gap-2">
							<span
								className="font-black leading-none text-(--color-text-on-dark)"
								style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}>
								От 500 ₽
							</span>
							<span className="text-lg font-semibold text-(--color-text-inverse-soft)">/мес</span>
						</div>
						<p className="text-lg font-semibold text-(--color-text-on-dark)">
							Под каждого животного индивидуальная стоимость
						</p>
						<p className="text-base leading-relaxed text-(--color-text-inverse-soft)">
							Куратор животного сам устанавливает стоимость опекунства, эта сумма может меняться и у
							каждого животного она разная
						</p>
					</div>
				</div>

				<div
					className={cn(
						'mt-10 flex items-center justify-center gap-3 rounded-2xl border border-(--color-text-on-dark)/15 bg-(--color-text-on-dark)/5 px-6 py-5 text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
					)}
					style={{ transitionDelay: '280ms' }}>
					<HeartHandshake className="h-5 w-5 shrink-0 text-(--color-brand-accent)" />
					<p className="text-sm font-semibold text-(--color-text-on-dark) sm:text-base">
						100% средств уходит на твоего подопечного. Деньги не размываются по приюту.
					</p>
				</div>
			</div>
		</section>
	);
};
