import { CreditCard, FileText, MessagesSquare, PawPrint, type LucideIcon } from 'lucide-react';
import { JSX } from 'react';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';

type Step = {
	number: string;
	title: string;
	description: string;
	Icon: LucideIcon;
};

const steps: Step[] = [
	{
		number: '01',
		title: 'Выбираешь подопечного',
		description:
			'В каталоге доступных животных найди того, кто откликнется в сердце. На карточке свободных питомцев есть кнопка «Стать опекуном».',
		Icon: PawPrint
	},
	{
		number: '02',
		title: 'Заполняешь форму',
		description:
			'Имя, email и Telegram-ник. Если ты уже зарегистрирован — войди в аккаунт, и форма заполнится автоматически.',
		Icon: FileText
	},
	{
		number: '03',
		title: 'Оплачиваешь первый месяц',
		description: 'Фиксированная сумма. Все средства идут на конкретного твоего подопечного.',
		Icon: CreditCard
	},
	{
		number: '04',
		title: 'Активируешь Telegram-бот',
		description: 'После оплаты на почту придёт ссылка. Один клик — и бот начнёт присылать новости и фотоотчёты.',
		Icon: MessagesSquare
	}
];

export const HowItWorksSection = (): JSX.Element => {
	const { ref, inView } = useInView({ threshold: 0.15 });

	return (
		<section
			id="how-it-works"
			ref={ref as React.RefObject<HTMLElement>}
			className="rounded-4xl bg-(--color-bg-primary) py-20 lg:py-28">
			<div className="mx-auto max-w-[1280px] px-4 md:px-12">
				<div className="mx-auto mb-16 max-w-[760px] text-center">
					<h2
						className={cn(
							'font-black leading-tight tracking-tight text-(--color-text-primary) transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
							inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
						)}
						style={{ fontSize: 'clamp(2rem, 3.6vw, 3rem)' }}>
						Как это устроено
					</h2>
					<p
						className={cn(
							'mt-5 text-base text-(--color-text-secondary) transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] sm:text-lg',
							inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
						)}
						style={{ transitionDelay: '120ms' }}>
						Четыре простых шага — и подопечный знает, что у него есть человек.
					</p>
				</div>

				<div className="relative">
					<div
						aria-hidden
						className="absolute left-0 right-0 top-12 hidden h-px lg:block"
						style={{
							backgroundImage:
								'repeating-linear-gradient(to right, var(--color-border-soft) 0 8px, transparent 8px 16px)'
						}}
					/>
					<div className=" relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{steps.map((step, index) => (
							<div
								key={step.number}
								className={cn(
									'group flex flex-col gap-5 rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-7 shadow-[0_12px_30px_rgba(79,61,56,0.06)] transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(79,61,56,0.12)]',
									inView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
								)}
								style={{ transitionDelay: `${200 + index * 120}ms` }}>
								<div className="flex items-center justify-between">
									<span
										className="font-[Arial] font-black tracking-tight text-(--color-brand-accent)"
										style={{
											fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
											WebkitTextStrokeWidth: '1.5px',
											WebkitTextStrokeColor: 'var(--color-brand-accent)',
											color: 'transparent'
										}}>
										{step.number}
									</span>
									<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--color-brand-brown-soft) text-(--color-brand-brown)">
										<step.Icon className="h-6 w-6" />
									</span>
								</div>
								<h3 className="text-xl font-bold leading-tight text-(--color-text-primary)">
									{step.title}
								</h3>
								<p className="text-base leading-relaxed text-(--color-text-secondary)">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};
