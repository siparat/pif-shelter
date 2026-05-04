import { Coffee, Cross, Dog, HeartHandshake, ShieldAlert, Trees } from 'lucide-react';
import { JSX } from 'react';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';

type Zone = {
	number: string;
	icon: typeof Dog;
	title: string;
	stat: string;
	statLabel: string;
	text: string;
	className: string;
	textColor: string;
	gridArea: string;
};

const zones: Zone[] = [
	{
		number: '01',
		icon: Dog,
		title: 'Вольеры',
		stat: '120',
		statLabel: 'мест',
		text: 'Тёплые вольеры с подогреваемым полом, выгульными площадками и круглосуточным присмотром. Каждый житель получает своё пространство для сна, игры и отдыха.',
		className: 'bg-[#fe8651] text-white',
		textColor: 'text-white/85',
		gridArea: 'kennels'
	},
	{
		number: '02',
		icon: Cross,
		title: 'Ветеринарная клиника',
		stat: '24/7',
		statLabel: 'дежурство',
		text: 'Собственная клиника со стерилизационным блоком, рентгеном и УЗИ. Помощь оказывается не только подопечным, но и животным с улицы.',
		className: 'bg-[#3aacb4] text-white',
		textColor: 'text-white/85',
		gridArea: 'clinic'
	},
	{
		number: '03',
		icon: ShieldAlert,
		title: 'Карантин',
		stat: '14',
		statLabel: 'дней',
		text: 'Изолированный блок для новоприбывших. Каждое животное проходит обследование, прививки и адаптацию перед переводом в общие вольеры.',
		className: 'bg-[#ffc8df] text-[#4F3D38]',
		textColor: 'text-(--color-text-secondary)',
		gridArea: 'quarantine'
	},
	{
		number: '04',
		icon: Coffee,
		title: 'Кухня',
		stat: '40 кг',
		statLabel: 'корма в день',
		text: 'Готовим индивидуальные рационы — щенки, пожилые, больные и здоровые получают разное питание.',
		className: 'bg-[#d8d3a5] text-[#4F3D38]',
		textColor: 'text-(--color-text-secondary)',
		gridArea: 'kitchen'
	},
	{
		number: '05',
		icon: Trees,
		title: 'Выгульная зона',
		stat: '600 м²',
		statLabel: 'на свежем воздухе',
		text: 'Огороженная территория для прогулок, тренировок и социализации.',
		className: 'bg-[#bdceac] text-[#4F3D38]',
		textColor: 'text-(--color-text-secondary)',
		gridArea: 'walking'
	},
	{
		number: '06',
		icon: HeartHandshake,
		title: 'Комната знакомств',
		stat: '∞',
		statLabel: 'счастливых встреч',
		text: 'Уютное пространство, где будущие хозяева спокойно знакомятся со своим будущим питомцем.',
		className: 'bg-[#1c1a27] text-white',
		textColor: 'text-white/70',
		gridArea: 'meeting'
	}
];

export const ShelterMapSection = (): JSX.Element => {
	const { ref: headRef, inView: headInView } = useInView({ threshold: 0.2 });
	const { ref: gridRef, inView: gridInView } = useInView({ threshold: 0.05 });

	return (
		<section className="relative overflow-hidden">
			<div
				ref={headRef as React.RefObject<HTMLDivElement>}
				className={cn(
					'mb-10 flex flex-col items-start justify-between gap-6 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] md:flex-row md:items-end',
					headInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
				)}>
				<div className="max-w-[640px]">
					<h2 className="section-title mt-2">Как устроен приют</h2>
					<p className="mt-4 text-base leading-relaxed text-(--color-text-secondary) md:text-lg">
						Приют — это не просто крыша над головой. Это шесть разных миров, в которых животные
						восстанавливаются, растут и находят свой дом.
					</p>
				</div>
				<div className="hidden items-center gap-3 rounded-full border border-(--color-border-soft) bg-(--color-surface-primary) px-4 py-2 md:inline-flex">
					<span className="h-2 w-2 animate-pulse rounded-full bg-(--color-brand-accent)" />
					<span className="text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
						6 зон · 2 400 м²
					</span>
				</div>
			</div>

			<div
				ref={gridRef as React.RefObject<HTMLDivElement>}
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:[grid-template-areas:'kennels_kennels_clinic_clinic''quarantine_kitchen_walking_meeting'] lg:grid-cols-4 lg:grid-rows-2">
				{zones.map(
					({ number, icon: Icon, title, stat, statLabel, text, className, textColor, gridArea }, i) => (
						<article
							key={number}
							style={{
								transitionDelay: `${i * 90}ms`,
								['--grid-area' as string]: gridArea
							}}
							className={cn(
								'group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] hover:-translate-y-1 hover:shadow-lg lg:p-7 lg:[grid-area:var(--grid-area)]',
								className,
								gridInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
							)}>
							<div
								className="pointer-events-none absolute -right-4 -top-4 select-none text-[120px] font-black leading-none opacity-[0.08] lg:text-[160px]"
								aria-hidden>
								{number}
							</div>

							<div className="relative flex items-start justify-between">
								<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
									<Icon className="h-5 w-5" />
								</div>
								<span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">
									{number}
								</span>
							</div>

							<div className="relative mt-8">
								<h3 className="text-xl font-black leading-tight md:text-2xl">{title}</h3>
								<p className={cn('mt-2 text-sm leading-relaxed', textColor)}>{text}</p>
							</div>

							<div className="relative mt-6 flex items-baseline gap-2 border-t border-current/15 pt-4">
								<span className="text-3xl font-black leading-none md:text-4xl">{stat}</span>
								<span className={cn('text-xs font-semibold uppercase tracking-widest', textColor)}>
									{statLabel}
								</span>
							</div>
						</article>
					)
				)}
			</div>
		</section>
	);
};
