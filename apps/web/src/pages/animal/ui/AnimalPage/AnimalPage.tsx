import { JSX } from 'react';
import { useParams } from 'react-router-dom';
import { useAnimalQuery } from '../../../../entities/animal';
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

	return (
		<div className="flex flex-col gap-8 pb-10 md:gap-12">
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
