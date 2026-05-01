import { JSX } from 'react';
import { donationsFaqItems } from '../../../../../shared/config/faq';
import { AccordionItem } from '../../../../../shared/ui';

export const FaqSection = (): JSX.Element => {
	return (
		<section className="flex flex-col gap-4 sm:gap-6" aria-labelledby="faq-title">
			<div className="text-center md:text-left">
				<p className="eyebrow inline-block text-(--color-brand-accent) max-md:mx-auto">Вопросы</p>
				<h2 id="faq-title" className="section-title mt-2 text-(--color-text-primary)">
					Частые вопросы
				</h2>
			</div>
			<div className="flex flex-col gap-3">
				{donationsFaqItems.map((item) => (
					<AccordionItem key={item.id} title={item.question}>
						<p>{item.answer}</p>
					</AccordionItem>
				))}
			</div>
		</section>
	);
};
