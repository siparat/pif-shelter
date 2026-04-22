import { UserRole } from '@pif/shared';
import { Loader2, MessageSquareMore, Plus } from 'lucide-react';
import { JSX, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PostCard, useAnimalPostsInfinite } from '../../../../entities/post';
import { useSession } from '../../../../entities/session/model/hooks';
import { useVolunteers } from '../../../../entities/volunteer/model/hooks';
import { PostActionsMenu } from '../../../../features/post-actions';
import { ROUTES } from '../../../../shared/config';

interface Props {
	animalId: string;
	canCreate?: boolean;
}

export const AnimalPostsBlock = ({ animalId, canCreate = false }: Props): JSX.Element => {
	const navigate = useNavigate();
	const { data: session } = useSession();
	const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useAnimalPostsInfinite(animalId);

	const role = session?.user.role;
	const isStaff = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
	const { data: volunteers } = useVolunteers({ enabled: isStaff });
	const authorNameById = useMemo(() => {
		const map = new Map<string, string>();
		volunteers?.forEach((volunteer) => map.set(volunteer.id, volunteer.name));
		return map;
	}, [volunteers]);

	const posts = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
	const total = data?.pages[0]?.meta.total ?? 0;

	const openPost = (postId: string): void => {
		navigate(ROUTES.postDetails.replace(':animalId', animalId).replace(':postId', postId));
	};

	return (
		<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-4">
			<header className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<MessageSquareMore size={20} className="text-(--color-text-secondary)" />
					<h2 className="text-xl font-semibold">Посты {total > 0 && <span>({total})</span>}</h2>
				</div>
				{canCreate && (
					<Link
						to={ROUTES.postCreate.replace(':id', animalId)}
						className="inline-flex items-center gap-2 rounded-xl bg-(--color-brand-orange) hover:bg-(--color-brand-orange)-hover text-white px-4 py-2 text-sm font-semibold transition-colors">
						<Plus size={16} />
						Создать пост
					</Link>
				)}
			</header>

			{isLoading && (
				<div className="flex items-center justify-center py-10">
					<Loader2 className="animate-spin text-(--color-brand-orange)" size={28} />
				</div>
			)}

			{isError && <p className="text-sm text-red-500 px-1">{error?.message ?? 'Не удалось загрузить посты'}</p>}

			{!isLoading && !isError && posts.length === 0 && (
				<div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
					<MessageSquareMore size={36} className="text-(--color-text-secondary)" />
					<p className="text-sm text-(--color-text-secondary) max-w-md">
						Пока нет постов. Расскажите историю этого животного.
					</p>
					{canCreate && (
						<Link
							to={ROUTES.postCreate.replace(':id', animalId)}
							className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-bg-primary) px-4 py-2 text-sm font-semibold hover:border-(--color-brand-orange) hover:text-(--color-brand-orange) transition-colors">
							<Plus size={14} />
							Написать первый пост
						</Link>
					)}
				</div>
			)}

			{posts.length > 0 && (
				<div className="grid gap-3 md:grid-cols-2">
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							authorName={authorNameById.get(post.authorId) ?? null}
							onOpen={() => openPost(post.id)}
							actionsSlot={
								<PostActionsMenu
									postId={post.id}
									animalId={post.animalId}
									authorId={post.authorId}
									title={post.title}
								/>
							}
						/>
					))}
				</div>
			)}

			{hasNextPage && (
				<div className="flex justify-center pt-2">
					<button
						type="button"
						onClick={() => void fetchNextPage()}
						disabled={isFetchingNextPage}
						className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-bg-primary) px-5 py-2 text-sm font-semibold hover:border-(--color-brand-orange) hover:text-(--color-brand-orange) transition-colors disabled:opacity-60">
						{isFetchingNextPage ? (
							<>
								<Loader2 size={14} className="animate-spin" />
								Загружаем...
							</>
						) : (
							<>Показать ещё</>
						)}
					</button>
				</div>
			)}
		</section>
	);
};
