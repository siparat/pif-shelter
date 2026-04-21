import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { JSX } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config';
import { useAnimalPosts } from '../../model/hooks';

interface Props {
	animalId: string;
	canCreate?: boolean;
}

export const AnimalPostsBlock = ({ animalId, canCreate = false }: Props): JSX.Element => {
	const { data, isLoading, isError, error } = useAnimalPosts(animalId);
	const posts = data?.data ?? [];
	const total = data?.meta.total ?? 0;

	return (
		<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-4">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-xl font-semibold">Посты ({total})</h2>
				{canCreate && (
					<Link
						to={ROUTES.postCreate.replace(':id', animalId)}
						className="inline-flex items-center gap-2 rounded-xl bg-(--color-brand-orange) hover:bg-(--color-brand-orange)-hover text-white px-4 py-2 text-sm font-semibold transition-colors">
						<Plus size={16} />
						Создать пост
					</Link>
				)}
			</div>

			{isLoading && <p className="text-(--color-text-secondary)">Загрузка постов...</p>}
			{isError && <p className="text-red-500 text-sm">{error?.message ?? 'Не удалось загрузить посты'}</p>}
			{!isLoading && !isError && posts.length === 0 && (
				<p className="text-(--color-text-secondary)">Для этого животного пока нет постов.</p>
			)}

			{!isLoading && !isError && posts.length > 0 && (
				<div className="space-y-2">
					{posts.map((post) => (
						<div
							key={post.id}
							className="rounded-xl border border-(--color-border) bg-(--color-bg-primary) p-3 space-y-1">
							<div className="flex items-center justify-between gap-3">
								<p className="font-semibold">{post.title}</p>
								<span className="text-xs text-(--color-text-secondary)">
									{dayjs(post.createdAt).format('DD.MM.YYYY HH:mm')}
								</span>
							</div>
							{post.media.length > 0 && (
								<p className="text-sm text-(--color-text-secondary)">Вложений: {post.media.length}</p>
							)}
							<p className="text-xs text-(--color-text-secondary)">
								Видимость: {post.visibility === 'PUBLIC' ? 'Публичный' : 'Приватный'}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
