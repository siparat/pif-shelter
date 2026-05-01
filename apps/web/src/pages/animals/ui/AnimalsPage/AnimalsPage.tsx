import {
	AnimalCoatEnum,
	AnimalCoatNames,
	AnimalGenderEnum,
	AnimalGenderNames,
	AnimalSizeEnum,
	AnimalSpeciesEnum,
	AnimalSpeciesNames
} from '@pif/shared';
import { JSX, useEffect, useMemo, useRef } from 'react';
import { AnimalCard, useAnimalsInfiniteQuery } from '../../../../entities/animal';
import { animalsCatalogFaqItems } from '../../../../shared/config/faq';
import { AccordionItem } from '../../../../shared/ui';
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

const AnimalsPage = (): JSX.Element => {
	const { state, setSpecies, setFilter, reset } = useAnimalFilters();
	const hasActiveFilters = isFilterActive(state);

	const queryFilters = useMemo(() => filtersStateToQuery(state), [state]);
	const animalsQuery = useAnimalsInfiniteQuery(queryFilters);

	const animals = useMemo(() => animalsQuery.data?.pages.flatMap((page) => page.data) ?? [], [animalsQuery.data]);
	const total = animalsQuery.data?.pages[0]?.meta.total ?? 0;
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

	return (
		<div className="flex flex-col gap-8 pb-6 md:gap-10">
			<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_10px_30px_rgba(79,61,56,0.08)] sm:p-5 md:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="eyebrow text-(--color-brand-accent)">Найди своего друга в приюте</p>
						<h1 className="mt-2 text-[24px] font-black uppercase tracking-[0.02em] text-(--color-text-primary) sm:text-[30px]">
							Животные
						</h1>
					</div>
					<div className="rounded-full bg-(--color-brand-brown-soft) px-4 py-2 text-[13px] font-semibold text-(--color-text-secondary)">
						Найдено: {total}
					</div>
				</div>

				<div className="mt-5 flex flex-col gap-3 rounded-2xl bg-(--color-brand-brown-soft)/60 p-3 sm:p-4">
					<FilterChipGroup label="Вид" options={speciesOptions} value={state.species} onChange={setSpecies} />
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
			</section>

			{animalsQuery.isError && (
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

			{animalsQuery.isPending && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
					Загружаем питомцев...
				</section>
			)}

			{!animalsQuery.isPending && !animalsQuery.isError && animals.length === 0 && (
				<section className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-(--color-text-secondary)">
					По текущим фильтрам ничего не найдено. Попробуйте убрать часть ограничений.
				</section>
			)}

			{rows.length > 0 && (
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

			{!animalsQuery.isPending && !animalsQuery.isError && animals.length > 0 && (
				<div ref={loadMoreRef} aria-hidden className="h-px w-full" />
			)}

			{animalsQuery.isFetchingNextPage && (
				<div className="flex justify-center text-sm text-(--color-text-secondary)">Загружаем...</div>
			)}
		</div>
	);
};

export default AnimalsPage;
