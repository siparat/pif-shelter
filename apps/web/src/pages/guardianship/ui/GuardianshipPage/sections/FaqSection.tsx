import { JSX } from 'react';
import { guardianshipFaqItems } from '../../../../../shared/config/faq';
import { cn } from '../../../../../shared/lib/cn';
import { useInView } from '../../../../../shared/lib/use-in-view';
import { AccordionItem } from '../../../../../shared/ui/accordion-item/AccordionItem';

export const FaqSection = (): JSX.Element => {
	const { ref, inView } = useInView({ threshold: 0.1 });

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
						Частые вопросы
					</h2>
					<p
						className={cn(
							'mt-5 text-base text-(--color-text-secondary) transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)] sm:text-lg',
							inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
						)}
						style={{ transitionDelay: '120ms' }}>
						Если что-то осталось непонятным — напиши нам, ответим.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
					{guardianshipFaqItems.map((faq, index) => (
						<div
							key={faq.id}
							className={cn(
								'transition-all duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
								inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
							)}
							style={{ transitionDelay: `${index * 80}ms` }}>
							<AccordionItem title={faq.question}>
								<p className="text-base leading-relaxed text-(--color-text-secondary)">{faq.answer}</p>
							</AccordionItem>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
