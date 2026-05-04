import { JSX, useState } from 'react';
import { faqItems, faqTopicLabels, FAQ_TOPICS, FaqTopic } from '../../../../shared/config/faq';
import { AccordionItem } from '../../../../shared/ui';
import { ChoiceChipGroup } from '../../../../shared/ui/choice-chip-group/ChoiceChipGroup';

const ALL = 'all' as const;
type FilterValue = FaqTopic | typeof ALL;

const chips: { value: FilterValue; label: string }[] = [
	{ value: ALL, label: 'Все вопросы' },
	...FAQ_TOPICS.map((t) => ({ value: t as FilterValue, label: faqTopicLabels[t] }))
];

export const FaqPage = (): JSX.Element => {
	const [filter, setFilter] = useState<FilterValue>(ALL);

	const visible = filter === ALL ? faqItems : faqItems.filter((item) => item.topics.includes(filter as FaqTopic));

	return (
		<main className="mx-auto max-w-[860px] px-6 py-12 md:py-16">
			<div className="mb-8 md:mb-10">
				<p className="eyebrow inline-block text-(--color-brand-accent)">Помощь</p>
				<h1 className="mt-2 text-3xl font-black tracking-tight text-(--color-text-primary) md:text-4xl">
					Частые вопросы
				</h1>
				<p className="mt-3 text-base text-(--color-text-secondary)">
					Здесь собраны ответы на вопросы об уходе, пожертвованиях, опекунстве и работе приюта.
				</p>
			</div>

			<ChoiceChipGroup items={chips} selectedValue={filter} onSelect={setFilter} className="mb-8" />

			{visible.length === 0 ? (
				<p className="text-center text-(--color-text-secondary) py-12">Вопросов по этой теме пока нет.</p>
			) : (
				<div className="flex flex-col gap-3">
					{visible.map((item) => (
						<AccordionItem key={item.id} title={item.question}>
							<p>{item.answer}</p>
						</AccordionItem>
					))}
				</div>
			)}
		</main>
	);
};

export default FaqPage;
