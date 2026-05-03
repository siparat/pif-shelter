import { Camera, Crown, Footprints, type LucideIcon } from 'lucide-react';
import { JSX } from 'react';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';

type Benefit = {
	title: string;
	description: string;
	Icon: LucideIcon;
};

const benefits: Benefit[] = [
	{
		title: 'Эксклюзивный статус',
		description:
			'Только ты будешь опекуном этого животного. Имя на карточке. Никто другой не сможет занять твоё место.',
		Icon: Crown
	},
	{
		title: 'Личные отчёты раз в месяц',
		description:
			'Фото и видео твоего подопечного приходят прямо в Telegram. Видишь, как он растёт, лечится, играет.',
		Icon: Camera
	},
	{
		title: 'Приоритет на прогулку',
		description: 'Хочешь увидеть подопечного лично? У опекунов отдельная очередь — без ожидания.',
		Icon: Footprints
	}
];

export const BenefitsSection = (): JSX.Element => {
	const { ref, inView } = useInView({ threshold: 0.15 });

	return (
		<section
			ref={ref as React.RefObject<HTMLElement>}
			className="rounded-4xl bg-(--color-surface-primary) py-20 lg:py-28">
			<div className="mx-auto max-w-[1280px] px-4 md:px-12">
				<div className="mb-14 max-w-[760px]">
					<h2
						className={cn(
							'font-black leading-tight tracking-tight text-(--color-text-primary) transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
							inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
						)}
						style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}>
						Что ты получаешь
					</h2>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{benefits.map((benefit, index) => (
						<div
							key={benefit.title}
							className={cn(
								'flex flex-col gap-6 rounded-3xl border border-(--color-border-soft) bg-(--color-bg-primary) p-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(79,61,56,0.12)]',
								inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
							)}
							style={{ transitionDelay: `${index * 140}ms` }}>
							<span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-brand-accent)/15 text-(--color-brand-accent)">
								<benefit.Icon className="h-8 w-8" strokeWidth={2} />
							</span>
							<h3 className="text-2xl font-bold leading-tight text-(--color-text-primary)">
								{benefit.title}
							</h3>
							<p className="text-base leading-relaxed text-(--color-text-secondary)">
								{benefit.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
