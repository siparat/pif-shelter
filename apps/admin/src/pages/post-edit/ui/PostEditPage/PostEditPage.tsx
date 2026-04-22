import { Loader2 } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnimalDetails } from '../../../../entities/animal';
import { CreatePostPayload, useCanEditPost, usePostDetails, useUpdatePostMutation } from '../../../../entities/post';
import { PostEditor, PostEditorInitialMediaDraft } from '../../../../features/post-editor';
import { getErrorMessage } from '../../../../shared/api';
import { ROUTES } from '../../../../shared/config';
import { getMediaUrl } from '../../../../shared/lib';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';

export const PostEditPage = (): JSX.Element => {
	const { animalId, postId } = useParams<{ animalId: string; postId: string }>();
	const navigate = useNavigate();
	const updateMutation = useUpdatePostMutation();

	const {
		data: post,
		isPending: isPostPending,
		isError: isPostError,
		error: postError,
		refetch: refetchPost
	} = usePostDetails(postId ?? null);

	const { data: animal } = useAnimalDetails(animalId ?? null);
	const canEdit = useCanEditPost({ authorId: post?.authorId });

	const initialMedia = useMemo<PostEditorInitialMediaDraft[]>(
		() =>
			post?.media.map((item) => ({
				storageKey: item.storageKey,
				type: item.type,
				previewUrl: getMediaUrl(item.storageKey)
			})) ?? [],
		[post]
	);

	const defaultValues = useMemo(
		() =>
			post
				? {
						title: post.title,
						body: post.body,
						visibility: post.visibility,
						media: []
					}
				: undefined,
		[post]
	);

	if (!animalId || !postId) {
		return <ErrorState description="Некорректный идентификатор поста." onRetry={() => navigate(ROUTES.animals)} />;
	}

	if (isPostPending) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (isPostError || !post) {
		return (
			<ErrorState
				description={postError?.message ?? 'Пост не найден или недоступен.'}
				onRetry={() => void refetchPost()}
			/>
		);
	}

	const backToPost = (): void => {
		navigate(ROUTES.postDetails.replace(':animalId', animalId).replace(':postId', postId));
	};

	if (!canEdit) {
		return <ErrorState description="Недостаточно прав для редактирования этого поста." onRetry={backToPost} />;
	}

	const handleSubmit = async (payload: CreatePostPayload): Promise<void> => {
		try {
			await updateMutation.mutateAsync({
				id: post.id,
				payload: {
					title: payload.title,
					body: payload.body,
					visibility: payload.visibility,
					media: payload.media
				}
			});
			toast.success('Пост обновлён');
			backToPost();
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title={`Редактирование поста${animal ? `: ${animal.name}` : ''}`} subtitle={post.title}>
				<Button type="button" appearance="ghost" className="mt-0 md:w-auto px-6 py-2" onClick={backToPost}>
					Отмена
				</Button>
			</PageTitle>

			<PostEditor
				animalId={post.animalId}
				defaultValues={defaultValues}
				initialMedia={initialMedia}
				onSubmit={handleSubmit}
				onCancel={backToPost}
				submitLabel="Сохранить изменения"
				isSubmitting={updateMutation.isPending}
			/>
		</div>
	);
};

export default PostEditPage;
