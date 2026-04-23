import { UserRole } from '@pif/shared';
import { Loader2 } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnimalDetails, useCanEditAnimal } from '../../../../entities/animal';
import { useSession } from '../../../../entities/session/model/hooks';
import { useVolunteers } from '../../../../entities/volunteer/model/hooks';
import { AnimalPostsBlock } from '../../../../widgets/animal-posts-block';
import { ROUTES } from '../../../../shared/config';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';
import { AnimalCharacteristics } from './AnimalCharacteristics';
import { AnimalDescription } from './AnimalDescription';
import { AnimalGallery } from './AnimalGallery';
import { AnimalGuardianSection } from './AnimalGuardianSection';
import { AnimalMainInfo } from './AnimalMainInfo';
import { AnimalMeta } from './AnimalMeta';
import { AnimalStatuses } from './AnimalStatuses';
import { AnimalTags } from './AnimalTags';

export const AnimalPage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: session } = useSession();

	const {
		data: detailAnimal,
		isPending: isDetailPending,
		isError: isDetailError,
		error: detailError,
		refetch: refetchDetail
	} = useAnimalDetails(id ?? null);

	const role = session?.user.role;
	const canManage = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
	const canEdit = useCanEditAnimal({ curatorId: detailAnimal?.curatorId ?? null });
	const canCreatePost = canEdit;

	const { data: volunteers } = useVolunteers({ enabled: canManage });
	const curatorName = useMemo(() => {
		if (!detailAnimal?.curatorId) return null;
		const volunteer = volunteers?.find((item) => item.id === detailAnimal.curatorId);
		return volunteer?.name ?? detailAnimal.curatorId;
	}, [detailAnimal?.curatorId, volunteers]);

	if (!id) {
		return (
			<ErrorState description="Некорректный идентификатор животного." onRetry={() => navigate(ROUTES.animals)} />
		);
	}

	if (isDetailPending) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (isDetailError || !detailAnimal) {
		return (
			<ErrorState
				description={detailError?.message ?? 'Карточка животного не найдена.'}
				onRetry={() => void refetchDetail()}
			/>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<PageTitle
				title={`Карточка: ${detailAnimal.name}`}
				subtitle="Обзор животного, связанные посты и точки управления.">
				<div className="flex items-center gap-2">
					<Button
						type="button"
						appearance="ghost"
						className="mt-0 md:w-auto px-6 py-2"
						onClick={() => navigate(ROUTES.animals)}>
						Назад к списку
					</Button>
					{canEdit && (
						<Button
							type="button"
							className="mt-0 md:w-auto px-6 py-2"
							onClick={() => navigate(ROUTES.animalEdit.replace(':id', detailAnimal.id))}>
							Редактировать
						</Button>
					)}
				</div>
			</PageTitle>

			<AnimalMainInfo animal={detailAnimal} curatorName={curatorName ?? 'Не назначен'} />

			<AnimalGuardianSection
				animalId={detailAnimal.id}
				animalName={detailAnimal.name}
				animalCuratorId={detailAnimal.curatorId}
			/>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<AnimalCharacteristics animal={detailAnimal} />
				<AnimalStatuses animal={detailAnimal} />
			</div>

			<AnimalTags tags={detailAnimal.tags} />

			<AnimalDescription animalId={detailAnimal.id} description={detailAnimal.description} canEdit={canEdit} />

			<AnimalGallery animalId={detailAnimal.id} urls={detailAnimal.galleryUrls} canEdit={canEdit} />

			<AnimalPostsBlock animalId={detailAnimal.id} canCreate={canCreatePost} />

			{canManage && <AnimalMeta createdAt={detailAnimal.createdAt} updatedAt={detailAnimal.updatedAt} />}
		</div>
	);
};

export default AnimalPage;
