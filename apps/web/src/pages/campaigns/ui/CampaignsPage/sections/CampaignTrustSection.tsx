import { CheckCircle2, Heart, ShieldCheck } from 'lucide-react';
import { JSX } from 'react';

const points = [
	{
		icon: ShieldCheck,
		title: 'Прозрачный прогресс',
		text: 'Показываем цель, текущую сумму и сколько осталось до закрытия каждого сбора.'
	},
	{
		icon: CheckCircle2,
		title: 'Целевые статьи расходов',
		text: 'Каждый сбор привязан к конкретной медицинской задаче и этапу восстановления.'
	},
	{
		icon: Heart,
		title: 'Поддержка без барьеров',
		text: 'История животного всегда остается рядом.'
	}
];

export const CampaignTrustSection = (): JSX.Element => {
	return (
		<section className="rounded-4xl border border-(--color-border-soft) bg-(--color-surface-primary) p-5 shadow-[0_14px_34px_rgba(79,61,56,0.1)] sm:p-6">
			<h2 className="text-xl font-bold text-(--color-text-primary) sm:text-2xl">
				Почему людям легко поддерживать сборы
			</h2>
			<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
				{points.map((point) => (
					<div
						key={point.title}
						className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-secondary) p-4 transition-transform duration-300 hover:-translate-y-0.5">
						<point.icon className="h-5 w-5 text-(--color-brand-accent)" />
						<h3 className="mt-2 font-bold text-(--color-text-primary)">{point.title}</h3>
						<p className="mt-1 text-sm leading-relaxed text-(--color-text-secondary)">{point.text}</p>
					</div>
				))}
			</div>
		</section>
	);
};
