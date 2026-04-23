import { PostVisibilityEnum, UserRole } from '@pif/shared';
import dayjs from 'dayjs';
import { CalendarDays, Lock, Loader2, Unlock, User } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnimalDetails } from '../../../../entities/animal';
import { usePostDetails } from '../../../../entities/post';
import { useSession } from '../../../../entities/session/model/hooks';
import { useVolunteers } from '../../../../entities/volunteer/model/hooks';
import { PostActionsMenu } from '../../../../features/post-actions';
import { sanitizeEditorHtml } from '../../../../features/post-editor';
import { ROUTES } from '../../../../shared/config';
import { cn } from '../../../../shared/lib';
import { Button, ErrorState, PageTitle } from '../../../../shared/ui';
import { PostMediaBlock } from './PostMediaBlock';

export const PostDetailPage = (): JSX.Element => {
	const { animalId, postId } = useParams<{ animalId: string; postId: string }>();
	const navigate = useNavigate();
	const { data: session } = useSession();

	const {
		data: post,
		isPending: isPostPending,
		isError: isPostError,
		error: postError,
		refetch: refetchPost
	} = usePostDetails(postId ?? null);

	const { data: animal } = useAnimalDetails(animalId ?? null);

	const role = session?.user.role;
	const isStaff = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
	const { data: volunteers } = useVolunteers({ enabled: isStaff });
	const authorName = useMemo(() => {
		if (!post) return null;
		return volunteers?.find((volunteer) => volunteer.id === post.authorId)?.name ?? null;
	}, [post, volunteers]);

	const sanitizedBody = useMemo(() => (post ? sanitizeEditorHtml(post.body) : ''), [post]);

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

	const isPrivate = post.visibility === PostVisibilityEnum.PRIVATE;
	const backToAnimal = (): void => navigate(ROUTES.animalDetails.replace(':id', animalId));
	const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);
	const isEdited = post.updatedAt && post.updatedAt !== post.createdAt;

	return (
		<div className="space-y-6 pb-10">
			<PageTitle
				title={post.title}
				subtitle={animal ? `Пост из истории: ${animal.name}` : 'Детальный просмотр поста'}>
				<div className="flex items-center gap-2">
					<Button
						type="button"
						appearance="ghost"
						className="mt-0 md:w-auto px-6 py-2"
						onClick={backToAnimal}>
						В карточку животного
					</Button>
				</div>
			</PageTitle>

			<article className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-5">
				<header className="flex flex-wrap items-start justify-between gap-3">
					<div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-(--color-text-secondary)">
						<span
							className={cn(
								'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium',
								isPrivate
									? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
									: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
							)}>
							{isPrivate ? <Lock size={12} /> : <Unlock size={12} />}
							{isPrivate ? 'Приватный' : 'Публичный'}
						</span>
						<span className="inline-flex items-center gap-1">
							<CalendarDays size={12} />
							{dayjs(post.createdAt).format('DD.MM.YYYY HH:mm')}
							{isEdited && (
								<span
									className="text-(--color-text-secondary)/70"
									title={`Изменён: ${dayjs(post.updatedAt).format('DD.MM.YYYY HH:mm')}`}>
									(изменён)
								</span>
							)}
						</span>
						<span className="inline-flex items-center gap-1">
							<User size={12} />
							{authorName ?? 'Автор'}
						</span>
						{(post.animalAgeYears > 0 || post.animalAgeMonths > 0) && (
							<span title="Возраст животного на момент публикации">
								· Возраст: {post.animalAgeYears} л. {post.animalAgeMonths % 12} мес.
							</span>
						)}
					</div>

					<PostActionsMenu
						postId={post.id}
						animalId={post.animalId}
						authorId={post.authorId}
						title={post.title}
						onDeleted={backToAnimal}
					/>
				</header>

				{post.media.length > 0 && <PostMediaBlock items={post.media} />}

				<div
					className="prose prose-sm md:prose-base max-w-none wrap-break-word text-(--color-text-primary) [&_a]:text-(--color-brand-orange) [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-(--color-border) [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:rounded-lg [&_pre]:bg-(--color-bg-primary) [&_pre]:p-3 [&_pre]:overflow-x-auto [&_code]:font-mono"
					dangerouslySetInnerHTML={{ __html: sanitizedBody }}
				/>

				{totalReactions > 0 && (
					<footer className="flex flex-wrap items-center gap-2 pt-2 border-t border-(--color-border)">
						<span className="text-xs text-(--color-text-secondary)">Реакции:</span>
						{post.reactions
							.filter((r) => r.count > 0)
							.map((r) => (
								<span
									key={r.emoji}
									className={cn(
										'inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-bg-primary) px-2.5 py-1 text-sm',
										r.isActive && 'border-(--color-brand-orange) text-(--color-brand-orange)'
									)}
									title={r.isActive ? 'Ваша реакция' : undefined}>
									<span>{r.emoji}</span>
									<span className="text-xs font-semibold">{r.count}</span>
								</span>
							))}
					</footer>
				)}
			</article>
		</div>
	);
};

export default PostDetailPage;
