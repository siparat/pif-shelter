import { UserRole } from '@pif/shared';
import { Loader2 } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnimalDetails } from '../../../../entities/animal';
import { CreatePostPayload, useCreatePostMutation } from '../../../../entities/post';
import { useSession } from '../../../../entities/session/model/hooks';
import { PostEditor } from '../../../../features/post-editor';
import { getErrorMessage } from '../../../../shared/api';
import { ROUTES } from '../../../../shared/config';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';

export const PostCreatePage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: session } = useSession();
	const createMutation = useCreatePostMutation();

	const {
		data: animal,
		isPending: isAnimalPending,
		isError: isAnimalError,
		error: animalError,
		refetch
	} = useAnimalDetails(id ?? null);

	const canCreate = useMemo(() => {
		if (!session?.user) return false;
		const role = session.user.role;
		if (role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER) return true;
		if (role === UserRole.VOLUNTEER && animal?.curatorId === session.user.id) return true;
		return false;
	}, [animal?.curatorId, session?.user]);

	if (!id) {
		return (
			<ErrorState description="Некорректный идентификатор животного." onRetry={() => navigate(ROUTES.animals)} />
		);
	}

	if (isAnimalPending) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (isAnimalError || !animal) {
		return (
			<ErrorState description={animalError?.message ?? 'Животное не найдено.'} onRetry={() => void refetch()} />
		);
	}

	if (!canCreate) {
		return (
			<ErrorState
				description="Недостаточно прав для создания поста. Доступно администратору, старшему волонтёру или куратору животного."
				onRetry={() => navigate(ROUTES.animalDetails.replace(':id', animal.id))}
			/>
		);
	}

	const handleSubmit = async (payload: CreatePostPayload): Promise<void> => {
		try {
			await createMutation.mutateAsync(payload);
			toast.success('Пост создан');
			navigate(ROUTES.animalDetails.replace(':id', animal.id));
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title={`Новый пост: ${animal.name}`} subtitle="Расскажите новости об этом животном.">
				<Button
					type="button"
					appearance="ghost"
					className="mt-0 md:w-auto px-6 py-2"
					onClick={() => navigate(ROUTES.animalDetails.replace(':id', animal.id))}>
					Вернуться в карточку
				</Button>
			</PageTitle>

			<PostEditor
				animalId={animal.id}
				onSubmit={handleSubmit}
				onCancel={() => navigate(ROUTES.animalDetails.replace(':id', animal.id))}
				isSubmitting={createMutation.isPending}
			/>
		</div>
	);
};

export default PostCreatePage;
