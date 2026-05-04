import { Heart, Home, Shield, Sparkles } from 'lucide-react';
import { JSX } from 'react';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';

const values = [
	{
		icon: Heart,
		title: 'Жизнь прежде всего',
		text: 'Каждое животное, которое к нам попадает, получает медицинскую помощь, еду и кров — вне зависимости от его состояния и шансов на пристройство. Мы не усыпляем здоровых животных.',
		accent: 'text-rose-500',
		bg: 'bg-rose-50'
	},
	{
		icon: Home,
		title: 'Дом, а не клетка',
		text: 'Мы стремимся к тому, чтобы приют был временным этапом, а не постоянным местом жизни. Каждый подопечный заслуживает настоящего дома и семьи, которая его ждёт.',
		accent: 'text-amber-500',
		bg: 'bg-amber-50'
	},
	{
		icon: Shield,
		title: 'Прозрачность и доверие',
		text: 'Мы публикуем финансовые отчёты, показываем список пожертвований и рассказываем, куда уходит каждый рубль. Доверие доноров — основа нашей работы.',
		accent: 'text-blue-500',
		bg: 'bg-blue-50'
	},
	{
		icon: Sparkles,
		title: 'Сообщество неравнодушных',
		text: 'Приют — это не только команда сотрудников, но и сотни волонтёров, опекунов и доноров. Вместе мы делаем то, что одному человеку не под силу.',
		accent: 'text-violet-500',
		bg: 'bg-violet-50'
	}
];

export const MissionSection = (): JSX.Element => {
	const { ref: headRef, inView: headInView } = useInView({ threshold: 0.2 });
	const { ref: valuesRef, inView: valuesInView } = useInView({ threshold: 0.1 });

	return (
		<section>
			<div
				ref={headRef as React.RefObject<HTMLDivElement>}
				className={cn(
					'mb-10 max-w-[680px] transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
					headInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
				)}>
				<h2 className="section-title">Миссия и ценности</h2>
				<p className="mt-4 text-base leading-relaxed text-(--color-text-secondary) md:text-lg">
					Приют ПИФ существует с одной целью — дать каждому бездомному животному шанс на безопасную жизнь и
					любящую семью. За двадцать лет работы эта цель не изменилась, только стала яснее.
				</p>
			</div>

			<div
				ref={valuesRef as React.RefObject<HTMLDivElement>}
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{values.map(({ icon: Icon, title, text, accent, bg }, i) => (
					<div
						key={title}
						className={cn(
							'flex flex-col gap-4 rounded-2xl border border-(--color-border-soft) p-5 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
							valuesInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
						)}
						style={{ transitionDelay: `${i * 80}ms` }}>
						<div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', bg)}>
							<Icon className={cn('h-5 w-5', accent)} />
						</div>
						<div>
							<h3 className="text-base font-bold text-(--color-text-primary)">{title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">{text}</p>
						</div>
					</div>
				))}
			</div>

			<blockquote
				className={cn(
					'mt-8 rounded-2xl bg-(--color-brand-brown) px-6 py-5 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] delay-300',
					valuesInView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
				)}>
				<p className="text-base font-semibold italic leading-relaxed text-(--color-text-on-dark) md:text-lg">
					«Мы верим, что мир становится лучше не от громких слов, а от тихих ежедневных поступков — накормить,
					вылечить, не бросить. Именно из таких поступков и состоит приют ПИФ.»
				</p>
				<p className="mt-3 text-sm font-semibold text-(--color-text-on-dark)/70">
					— Основатели приюта ПИФ, 2005
				</p>
			</blockquote>
		</section>
	);
};
