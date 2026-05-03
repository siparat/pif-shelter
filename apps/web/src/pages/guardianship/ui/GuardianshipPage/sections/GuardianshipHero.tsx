import { ArrowRight, Link as LinkIcon, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { JSX, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../../shared/config/routes';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';

export const GuardianshipHero = (): JSX.Element => {
	const { ref, inView } = useInView({ threshold: 0.1 });

	const handleScrollToNext = (event: MouseEvent<HTMLAnchorElement>): void => {
		event.preventDefault();
		const target = document.getElementById('how-it-works');
		if (target) {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	return (
		<section
			ref={ref as React.RefObject<HTMLElement>}
			className="relative overflow-hidden rounded-4xl bg-(--color-surface-primary) py-20 lg:py-28">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-70"
				style={{
					background:
						'radial-gradient(60% 60% at 80% 20%, rgba(254,134,81,0.18) 0%, rgba(254,134,81,0) 60%), radial-gradient(50% 50% at 10% 90%, rgba(234,215,191,0.6) 0%, rgba(234,215,191,0) 70%)'
				}}
			/>
			<div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-14 px-4 md:px-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
				<div
					className={cn(
						'flex flex-col gap-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
					)}>
					<span className="inline-flex w-fit items-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-(--color-brand-brown)">
						<Sparkles className="h-4 w-4 text-(--color-brand-accent)" />
						Программа приюта
					</span>
					<h1
						className="font-black leading-[1.05] tracking-tight text-(--color-text-primary)"
						style={{ fontSize: 'clamp(2rem, 4.6vw, 3.5rem)' }}>
						Стань опекуном даруй тепло на расстоянии
					</h1>
					<p className="max-w-[560px] text-base leading-relaxed text-(--color-text-secondary) sm:text-lg">
						Опекунство - это тёплая связь с конкретным подопечным. Ты гарантируешь ему еду, лекарства и
						внимание, а в ответ получаешь личные фото и видеоотчёты прямо в Telegram. Это маленькое
						обязательство, которое меняет одну жизнь полностью.
					</p>
					<div className="flex flex-wrap items-center gap-4">
						<Link
							to={ROUTES.animals}
							className="group inline-flex items-center gap-2 rounded-full bg-(--color-brand-accent) px-7 py-4 text-base font-semibold text-(--color-text-inverse) shadow-[0_12px_28px_rgba(254,134,81,0.35)] transition-transform hover:-translate-y-0.5">
							Выбрать подопечного
							<ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
						</Link>
						<a
							href="#how-it-works"
							onClick={handleScrollToNext}
							className="inline-flex items-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) px-7 py-4 text-base font-semibold text-(--color-brand-brown) transition-colors hover:bg-(--color-brand-brown-soft)">
							Узнать подробнее
						</a>
					</div>
				</div>

				<div
					className={cn(
						'relative h-[460px] transition-all duration-1000 ease-[cubic-bezier(0.34,1.3,0.64,1)] sm:h-[520px]',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
					)}>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="relative flex h-[80%] w-[85%] items-center justify-center overflow-hidden rounded-[40px] bg-linear-to-br from-(--color-brand-accent-strong) to-(--color-bg-primary) shadow-[0_30px_60px_rgba(79,61,56,0.18)]">
							<img
								className="w-full h-full object-cover"
								src="/guardianship-preview.png"
								alt="Опекунство"
							/>
						</div>
					</div>

					<div
						className="animate-float absolute left-0 top-6 flex items-center gap-3 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary)/90 px-4 py-3 shadow-[0_18px_36px_rgba(79,61,56,0.12)] backdrop-blur"
						style={{ animationDelay: '0s' }}>
						<span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand-accent)/15 text-(--color-brand-accent)">
							<ShieldCheck className="h-5 w-5" />
						</span>
						<span className="text-sm font-semibold text-(--color-brand-brown)">1 опекун = 1 животное</span>
					</div>

					<div
						className="animate-float absolute right-0 top-32 flex items-center gap-3 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary)/90 px-4 py-3 shadow-[0_18px_36px_rgba(79,61,56,0.12)] backdrop-blur"
						style={{ animationDelay: '1.5s' }}>
						<span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand-accent)/15 text-(--color-brand-accent)">
							<MessageCircle className="h-5 w-5" />
						</span>
						<span className="text-sm font-semibold text-(--color-brand-brown)">Отчёты в Telegram</span>
					</div>

					<div
						className="animate-float absolute bottom-6 left-8 flex items-center gap-3 rounded-2xl border border-(--color-border-soft) bg-(--color-surface-secondary)/90 px-4 py-3 shadow-[0_18px_36px_rgba(79,61,56,0.12)] backdrop-blur"
						style={{ animationDelay: '0.8s' }}>
						<span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand-accent)/15 text-(--color-brand-accent)">
							<LinkIcon className="h-5 w-5" />
						</span>
						<span className="text-sm font-semibold text-(--color-brand-brown)">
							Прямая связь с куратором
						</span>
					</div>
				</div>
			</div>
		</section>
	);
};
