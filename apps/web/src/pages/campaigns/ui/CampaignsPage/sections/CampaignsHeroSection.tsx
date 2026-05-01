import { HeartHandshake, Sparkles } from 'lucide-react';
import { JSX } from 'react';

type CampaignsHeroSectionProps = {
	onDonateNow: () => void;
	canDonateNow?: boolean;
};

export const CampaignsHeroSection = ({ onDonateNow, canDonateNow = true }: CampaignsHeroSectionProps): JSX.Element => {
	return (
		<section className="relative overflow-hidden rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) p-5 shadow-[0_18px_48px_rgba(79,61,56,0.12)] sm:p-7">
			<div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-(--color-brand-accent)/20 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-16 left-6 h-36 w-36 rounded-full bg-(--color-brand-accent-strong)/25 blur-3xl" />
			<div className="relative">
				<p className="eyebrow inline-flex items-center gap-1.5 text-(--color-brand-accent)">
					<Sparkles className="h-3.5 w-3.5" />
					Срочная помощь
				</p>
				<h1 className="mt-2 max-w-3xl text-balance text-[28px] font-black uppercase leading-tight tracking-[0.01em] text-(--color-text-primary) sm:text-[36px]">
					Каждый сбор здесь про шанс на жизнь и восстановление
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--color-text-secondary) sm:text-base">
					Мы собрали случаи, где помощь нужна прямо сейчас: операции, экстренная диагностика, терапия и
					реабилитация. Даже небольшой донат сдвигает лечение вперед.
				</p>
				<div className="mt-5 flex flex-wrap items-center gap-3">
					<button
						type="button"
						onClick={onDonateNow}
						disabled={!canDonateNow}
						className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-(--color-brand-accent) px-6 text-sm font-bold text-white shadow-[0_14px_28px_rgba(254,134,81,0.32)] transition-[transform,filter] hover:brightness-105 active:scale-[0.99]">
						<HeartHandshake className="h-4 w-4" />
						Помочь сейчас
					</button>
				</div>
			</div>
		</section>
	);
};
