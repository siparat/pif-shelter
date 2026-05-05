import { AnimalGenderNames, AnimalSpeciesNames } from '@pif/shared';
import { JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useAnimalQuery } from '../../../../entities/animal';
import { SITE_URL } from '../../../../shared/config/api';
import { getMediaUrl } from '../../../../shared/lib/get-media-url';
import { PageMeta } from '../../../../shared/ui/page-meta/PageMeta';
import { AnimalInfoSection, PeopleSection, PostsTimelineSection } from './sections';

const AnimalPage = (): JSX.Element => {
	const { slug } = useParams<{ slug: string }>();
	const animalQuery = useAnimalQuery(slug);

	if (animalQuery.isPending) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center text-sm text-(--color-text-secondary)">
				Загружаем карточку…
			</div>
		);
	}

	if (animalQuery.isError || !animalQuery.data) {
		return (
			<div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
				<p className="text-sm text-(--color-text-secondary)">Не удалось загрузить карточку животного.</p>
				<button
					type="button"
					onClick={() => animalQuery.refetch()}
					className="inline-flex h-10 items-center rounded-full bg-(--color-brand-accent) px-5 text-sm font-semibold text-white">
					Попробовать снова
				</button>
			</div>
		);
	}

	const animal = animalQuery.data;
	const speciesName = AnimalSpeciesNames[animal.species];
	const genderName = AnimalGenderNames[animal.gender];
	const description = animal.description
		? animal.description.slice(0, 155)
		: `${speciesName} · ${genderName} · ищет дом в приюте ПИФ.`;
	const image = animal.avatarUrl ? getMediaUrl(animal.avatarUrl) : undefined;

	return (
		<div className="flex flex-col gap-8 pb-10 md:gap-12">
			<PageMeta
				title={animal.name}
				description={description}
				image={image}
				url={`${SITE_URL}/animals/${slug}`}
				type="article"
			/>
			<AnimalInfoSection animal={animalQuery.data} />
			<PeopleSection animalId={animalQuery.data.id} curatorId={animalQuery.data.curatorId} />
			<PostsTimelineSection
				animalId={animalQuery.data.id}
				animalName={animalQuery.data.name}
				birthDate={animalQuery.data.birthDate}
			/>
		</div>
	);
};

export default AnimalPage;
