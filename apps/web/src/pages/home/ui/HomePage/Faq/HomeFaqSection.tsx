import { ArrowRight } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { faqItems } from '../../../../../shared/config/faq';
import { ROUTES } from '../../../../../shared/config/routes';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';
import { AccordionItem } from '../../../../../shared/ui';

const SHELTER_FAQ_IDS: (typeof faqItems)[number]['id'][] = [
	'how-introduction-works',
	'pre-transfer-check',
	'support-after-adoption',
	'help-with-items',
	'status-update-frequency'
];

const shelterFaqItems = faqItems.filter((item) => SHELTER_FAQ_IDS.includes(item.id));

export const HomeFaqSection = (): JSX.Element => {
	const { ref, inView } = useInView({ threshold: 0.1 });

	return (
		<section
			ref={ref as React.RefObject<HTMLElement>}
			className="w-full px-4 md:px-12 xl:px-12 py-16 md:py-24 mx-auto max-w-[1920px]">
			<div className="max-w-[860px] mx-auto">
				<div
					className={cn(
						'mb-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
					)}>
					<p className="eyebrow inline-block text-(--color-brand-accent)">Вопросы</p>
					<h2 className="mt-2 text-3xl font-black tracking-tight text-(--color-text-primary) md:text-4xl">
						О приюте
					</h2>
					<p className="mt-3 text-base text-(--color-text-secondary)">
						Как проходит знакомство, что нужно знать до пристройства и как мы поддерживаем после.
					</p>
				</div>

				<div className="flex flex-col gap-3">
					{shelterFaqItems.map((item, index) => (
						<div
							key={item.id}
							className={cn(
								'transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
								inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
							)}
							style={{ transitionDelay: `${index * 80}ms` }}>
							<AccordionItem title={item.question}>
								<p>{item.answer}</p>
							</AccordionItem>
						</div>
					))}
				</div>

				<div
					className={cn(
						'mt-6 flex justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
						inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
					)}
					style={{ transitionDelay: `${shelterFaqItems.length * 80}ms` }}>
					<Link
						to={ROUTES.faq}
						onClick={() => window.scrollTo(0, 0)}
						className="inline-flex items-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-primary) px-6 py-3 text-sm font-semibold text-(--color-text-primary) shadow-sm transition-all hover:border-(--color-brand-brown-muted) hover:shadow-md">
						Все вопросы
						<ArrowRight className="h-4 w-4 text-(--color-brand-accent)" />
					</Link>
				</div>
			</div>
		</section>
	);
};
