import {
	AnimalCoatEnum,
	AnimalCoatNames,
	AnimalGenderEnum,
	AnimalGenderNames,
	AnimalSizeEnum,
	AnimalSpeciesEnum,
	AnimalSpeciesNames
} from '@pif/shared';
import { JSX, useEffect, useMemo, useRef, useState } from 'react';
import { AnimalCard, AnimalDetails, useAnimalsByIdsQuery, useAnimalsInfiniteQuery } from '../../../../entities/animal';
import { AnimalAiSearch } from '../../../../features/animal-ai-search';
import { AiSearchSuggestion } from '../../../../features/animal-ai-search/model/use-ai-search';
import { animalsCatalogFaqItems } from '../../../../shared/config/faq';
import { AccordionItem } from '../../../../shared/ui';
import { PageMeta } from '../../../../shared/ui/page-meta/PageMeta';
import {
	AGE_PRESETS,
	AGE_PRESET_LABELS,
	filtersStateToQuery,
	isFilterActive
} from '../../../../widgets/animal-filters/model/types';
import { useAnimalFilters } from '../../../../widgets/animal-filters/model/use-animal-filters';
import { FilterChipGroup } from '../../../../widgets/animal-filters/ui/FilterChipGroup';
import { FilterToggle } from '../../../../widgets/animal-filters/ui/FilterToggle';

const CARDS_PER_ROW = 4;
const FAQ_ROW_INTERVAL = 2;

const chunkBy = <T,>(items: T[], size: number): T[][] => {
	const result: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		result.push(items.slice(i, i + size));
	}
	return result;
};

const speciesOptions = Object.values(AnimalSpeciesEnum).map((value) => ({
	value,
	label: AnimalSpeciesNames[value]
}));

const genderOptions = Object.values(AnimalGenderEnum).map((value) => ({
	value,
	label: AnimalGenderNames[value]
}));

const sizeOptions = [
	{ value: AnimalSizeEnum.SMALL, label: 'Маленький' },
	{ value: AnimalSizeEnum.MEDIUM, label: 'Средний' },
	{ value: AnimalSizeEnum.LARGE, label: 'Большой' }
];

const coatOptions = Object.values(AnimalCoatEnum).map((value) => ({
	value,
	label: AnimalCoatNames[value]
}));

const ageOptions = AGE_PRESETS.map((value) => ({
	value,
	label: AGE_PRESET_LABELS[value]
}));

type AiResult = { matchedIds: string[]; suggestions: AiSearchSuggestion[] };

const AnimalsPage = (): JSX.Element => {
	const [aiOpen, setAiOpen] = useState(true);
	const [aiResult, setAiResult] = useState<AiResult | null>(null);
	const { state, setSpecies, setFilter, reset } = useAnimalFilters();
	const hasActiveFilters = isFilterActive(state);

	const queryFilters = useMemo(() => filtersStateToQuery(state), [state]);
	const animalsQuery = useAnimalsInfiniteQuery(queryFilters);

	const animals = useMemo(() => animalsQuery.data?.pages.flatMap((page) => page.data) ?? [], [animalsQuery.data]);
	const total = animalsQuery.data?.pages[0]?.meta.total ?? 0;

	const allAiIds = useMemo(
		() => (aiResult ? [...aiResult.matchedIds, ...aiResult.suggestions.map((s) => s.id)] : []),
		[aiResult]
	);
	const aiAnimalsQuery = useAnimalsByIdsQuery(allAiIds);

	const aiAnimals = useMemo((): {
		matched: AnimalDetails[];
		suggestions: Array<{ animal: AnimalDetails; note: string }>;
	} | null => {
		if (!aiResult || !aiAnimalsQuery.data) return null;
		const all = aiAnimalsQuery.data;
		const matched = aiResult.matchedIds
			.map((id) => all.find((a) => a.id === id))
			.filter(Boolean) as AnimalDetails[];
		const suggestions = aiResult.suggestions
			.map((s) => ({ animal: all.find((a) => a.id === s.id), note: s.note }))
			.filter((s): s is { animal: AnimalDetails; note: string } => Boolean(s.animal));
		return { matched, suggestions };
	}, [aiResult, aiAnimalsQuery.data]);

	const rows = useMemo(() => chunkBy(animals, CARDS_PER_ROW), [animals]);
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const node = loadMoreRef.current;
		if (!node) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (!entry?.isIntersecting) {
					return;
				}
				if (!animalsQuery.hasNextPage || animalsQuery.isFetchingNextPage || animalsQuery.isError) {
					return;
				}
				void animalsQuery.fetchNextPage();
			},
			{ rootMargin: '320px 0px' }
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, [animalsQuery.fetchNextPage, animalsQuery.hasNextPage, animalsQuery.isError, animalsQuery.isFetchingNextPage]);

	const handleAiResult = (result: AiResult): void => {
		setAiResult(result);
	};

	const handleAiReset = (): void => {
		setAiResult(null);
	};

	const handleAiClose = (): void => {
		setAiOpen(false);
		setAiResult(null);
	};

	return (
		<div className="flex flex-col gap-8 pb-6 md:gap-10">
			<PageMeta
				title="Животные"
				description="Каталог животных приюта ПИФ. Кошки, собаки и другие питомцы в поисках любящего дома — выберите своего друга."
			/>
			<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_10px_30px_rgba(79,61,56,0.08)] sm:p-5 md:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="eyebrow text-(--color-brand-accent)">Найди своего друга в приюте</p>
						<h1 className="mt-2 text-[24px] font-black uppercase tracking-[0.02em] text-(--color-text-primary) sm:text-[30px]">
							Животные
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => setAiOpen((v) => !v)}
							className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
								aiOpen
									? 'border-(--color-brand-accent) bg-(--color-brand-accent)/10 text-(--color-brand-accent)'
									: 'border-(--color-border-soft) bg-(--color-brand-brown-soft) text-(--color-text-secondary) hover:border-(--color-brand-accent) hover:text-(--color-brand-accent)'
							}`}>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden>
								<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
								<path d="M19 3v4" />
								<path d="M21 5h-4" />
							</svg>
							ИИ-подбор
						</button>
						{aiResult ? (
							<div className="rounded-full bg-(--color-brand-accent)/10 px-4 py-2 text-[13px] font-semibold text-(--color-brand-accent)">
								Подобрано: {aiAnimals ? aiAnimals.matched.length + aiAnimals.suggestions.length : 0}
							</div>
						) : (
							<div className="rounded-full bg-(--color-brand-brown-soft) px-4 py-2 text-[13px] font-semibold text-(--color-text-secondary)">
								Найдено: {total}
							</div>
						)}
					</div>
				</div>

				{aiOpen && (
					<div className="mt-4 rounded-2xl border border-(--color-brand-accent)/20 bg-(--color-brand-accent)/5 p-4 sm:p-5">
						<AnimalAiSearch onClose={handleAiClose} onResult={handleAiResult} onReset={handleAiReset} />
					</div>
				)}

				{!aiResult && (
					<div className="mt-5 flex flex-col gap-3 rounded-2xl bg-(--color-brand-brown-soft)/60 p-3 sm:p-4">
						<FilterChipGroup
							label="Вид"
							options={speciesOptions}
							value={state.species}
							onChange={setSpecies}
						/>
						<FilterChipGroup
							label="Пол"
							options={genderOptions}
							value={state.gender}
							onChange={(value) => setFilter('gender', value)}
						/>
						<FilterChipGroup
							label="Размер"
							options={sizeOptions}
							value={state.size}
							onChange={(value) => setFilter('size', value)}
						/>
						<FilterChipGroup
							label="Шерсть"
							options={coatOptions}
							value={state.coat}
							onChange={(value) => setFilter('coat', value)}
						/>
						<FilterChipGroup
							label="Возраст"
							options={ageOptions}
							value={state.age}
							onChange={(value) => setFilter('age', value)}
						/>
						<div className="flex flex-wrap gap-2 pt-1">
							<FilterToggle
								label="Только стерилизованные"
								checked={Boolean(state.isSterilized)}
								onChange={(checked) => setFilter('isSterilized', checked)}
							/>
							<FilterToggle
								label="Только привитые"
								checked={Boolean(state.isVaccinated)}
								onChange={(checked) => setFilter('isVaccinated', checked)}
							/>
							<FilterToggle
								label="Только без паразитов"
								checked={Boolean(state.isParasiteTreated)}
								onChange={(checked) => setFilter('isParasiteTreated', checked)}
							/>
							{hasActiveFilters && (
								<button
									type="button"
									onClick={reset}
									className="inline-flex h-10 items-center justify-center rounded-full bg-(--color-surface-primary) px-4 text-[13px] font-semibold text-(--color-text-secondary) transition-colors hover:bg-white">
									Сбросить фильтры
								</button>
							)}
						</div>
					</div>
				)}

				{aiResult && (
					<div className="mt-4 flex items-center gap-3">
						{aiAnimals && aiAnimals.suggestions.length > 0 && (
							<p className="text-xs text-(--color-text-secondary)">
								Точных совпадений: {aiAnimals.matched.length}, похожих: {aiAnimals.suggestions.length}
							</p>
						)}
						<button
							type="button"
							onClick={handleAiReset}
							className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-(--color-border-soft) bg-(--color-surface-secondary) px-4 py-2 text-[13px] font-semibold text-(--color-text-secondary) transition-colors hover:border-(--color-brand-accent) hover:text-(--color-brand-accent)">
							Сбросить — показать всех
						</button>
					</div>
				)}
			</section>

			{!aiResult && animalsQuery.isError && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center">
					<p className="text-(--color-text-primary)">Не удалось загрузить животных. Попробуйте еще раз.</p>
					<button
						type="button"
						onClick={() => animalsQuery.refetch()}
						className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-(--color-brand-brown) px-5 text-sm font-semibold text-(--color-text-on-dark)">
						Обновить
					</button>
				</section>
			)}

			{!aiResult && animalsQuery.isPending && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
					Загружаем питомцев...
				</section>
			)}

			{!aiResult && !animalsQuery.isPending && !animalsQuery.isError && animals.length === 0 && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
					По текущим фильтрам ничего не найдено. Попробуйте убрать часть ограничений.
				</section>
			)}

			{aiResult && aiAnimals && aiAnimals.matched.length === 0 && aiAnimals.suggestions.length === 0 && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
					ИИ не нашёл подходящих животных. Попробуйте изменить описание.
				</section>
			)}

			{aiResult && aiAnimals && (aiAnimals.matched.length > 0 || aiAnimals.suggestions.length > 0) && (
				<section className="flex flex-col gap-6">
					{aiAnimals.matched.length > 0 && (
						<div className="flex flex-col gap-3">
							<p className="text-xs font-bold uppercase tracking-[0.14em] text-(--color-brand-accent)">
								Подходят
							</p>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{aiAnimals.matched.map((animal) => (
									<div key={animal.id} className="mx-auto w-full max-w-[360px]">
										<AnimalCard animal={animal} />
									</div>
								))}
							</div>
						</div>
					)}
					{aiAnimals.suggestions.length > 0 && (
						<div className="flex flex-col gap-3">
							<p className="text-xs font-bold uppercase tracking-[0.14em] text-(--color-text-secondary)">
								Могут подойти
							</p>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
								{aiAnimals.suggestions.map(({ animal, note }) => (
									<div key={animal.id} className="mx-auto w-full max-w-[360px]">
										<AnimalCard animal={animal} />
										<p className="mt-2 px-1 text-xs text-(--color-text-secondary)">{note}</p>
									</div>
								))}
							</div>
						</div>
					)}
				</section>
			)}

			{!aiResult && rows.length > 0 && (
				<section className="flex flex-col gap-6">
					{rows.map((row, index) => {
						const faqIndex = Math.floor((index + 1) / FAQ_ROW_INTERVAL) - 1;
						const faqItem = animalsCatalogFaqItems[faqIndex];
						const showFaq = (index + 1) % FAQ_ROW_INTERVAL === 0 && faqItem;

						return (
							<div key={`row-${index}`} className="flex flex-col gap-6">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
									{row.map((animal) => (
										<div key={animal.id} className="mx-auto w-full max-w-[360px]">
											<AnimalCard animal={animal} />
										</div>
									))}
								</div>
								{showFaq && (
									<div className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_10px_30px_rgba(79,61,56,0.08)] sm:p-5">
										<p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-(--color-brand-accent)">
											Полезно знать
										</p>
										<AccordionItem title={faqItem.question}>
											<p>{faqItem.answer}</p>
										</AccordionItem>
									</div>
								)}
							</div>
						);
					})}
				</section>
			)}

			{!aiResult && !animalsQuery.isPending && !animalsQuery.isError && animals.length > 0 && (
				<div ref={loadMoreRef} aria-hidden className="h-px w-full" />
			)}

			{!aiResult && animalsQuery.isFetchingNextPage && (
				<div className="flex justify-center text-sm text-(--color-text-secondary)">Загружаем...</div>
			)}
		</div>
	);
};

export default AnimalsPage;
