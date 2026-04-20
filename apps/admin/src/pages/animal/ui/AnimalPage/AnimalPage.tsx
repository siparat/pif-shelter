import { AnimalGenderNames, AnimalSpeciesNames, UserRole } from '@pif/shared';
import dayjs from 'dayjs';
import { Loader2 } from 'lucide-react';
import { JSX } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnimalDetails } from '../../../../entities/animal';
import { AnimalAvatar } from '../../../../entities/animal/ui/AnimalAvatar/AnimalAvatar';
import { AnimalStatusBadge } from '../../../../entities/animal/ui/AnimalStatusBadge/AnimalStatusBadge';
import { AnimalPostsBlock } from '../../../../entities/post';
import { useSession } from '../../../../entities/session/model/hooks';
import { ROUTES } from '../../../../shared/config';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';

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
	const canEdit = canManage || (role === UserRole.VOLUNTEER && detailAnimal?.curatorId === session?.user.id);

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

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6">
				<div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
					<div className="flex items-center gap-4">
						<AnimalAvatar animal={detailAnimal} width={96} height={96} rounded />
						<div>
							<p className="text-xl font-semibold">{detailAnimal.name}</p>
							<AnimalStatusBadge status={detailAnimal.status} />
							<p className="mt-2 text-sm text-(--color-text-secondary)">
								{AnimalSpeciesNames[detailAnimal.species]} · {AnimalGenderNames[detailAnimal.gender]} ·{' '}
								{dayjs().diff(dayjs(detailAnimal.birthDate), 'year')} г.
							</p>
						</div>
					</div>
					<div className="text-sm text-(--color-text-secondary) space-y-1">
						<p>
							Куратор:{' '}
							<span className="text-(--color-text-primary)">
								{detailAnimal.curatorId ? detailAnimal.curatorId : 'Не назначен'}
							</span>
						</p>
						<p>
							Стоимость опекунства:{' '}
							<span className="text-(--color-text-primary)">
								{detailAnimal.costOfGuardianship ? `${detailAnimal.costOfGuardianship} ₽` : 'Не задана'}
							</span>
						</p>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-3">
				<h2 className="text-xl font-semibold">Состояние животного</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
					<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
						<p className="text-(--color-text-secondary)">Стерилизация</p>
						<p className="font-semibold">{detailAnimal.isSterilized ? 'Да' : 'Нет'}</p>
					</div>
					<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
						<p className="text-(--color-text-secondary)">Вакцинация</p>
						<p className="font-semibold">{detailAnimal.isVaccinated ? 'Да' : 'Нет'}</p>
					</div>
					<div className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3">
						<p className="text-(--color-text-secondary)">Обработка от паразитов</p>
						<p className="font-semibold">{detailAnimal.isParasiteTreated ? 'Да' : 'Нет'}</p>
					</div>
				</div>
			</div>

			<AnimalPostsBlock animalId={detailAnimal.id} />
		</div>
	);
};

export default AnimalPage;
