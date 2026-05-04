import { AllowedPostReactionEmoji } from '@pif/shared';
import { BookOpen, Loader2 } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { useAnimalPostsInfiniteQuery, useSetPostReactionMutation } from '../../../../../../entities/post';
import { PostDetailsModal } from './PostDetailsModal';
import { PostTimelineCard } from './PostTimelineCard';

type Props = {
	animalId: string;
	animalName: string;
	birthDate: string;
};

const buildAvailableYears = (birthDate: string): number[] => {
	const start = new Date(birthDate).getFullYear();
	const end = new Date().getFullYear();
	const years: number[] = [];
	for (let y = end; y >= start; y--) {
		years.push(y);
	}
	return years;
};

export const PostsTimelineSection = ({ animalId, animalName, birthDate }: Props): JSX.Element | null => {
	const availableYears = useMemo(() => buildAvailableYears(birthDate), [birthDate]);
	const [selectedYear, setSelectedYear] = useState<number | null>(null);
	const [openPostId, setOpenPostId] = useState<string | null>(null);

	const postsQuery = useAnimalPostsInfiniteQuery(animalId, selectedYear);
	const reactionMutation = useSetPostReactionMutation(animalId, selectedYear);

	const allPosts = useMemo(() => postsQuery.data?.pages.flatMap((p) => p.data) ?? [], [postsQuery.data]);
	const total = postsQuery.data?.pages[0]?.meta.total ?? 0;

	const handleReact = (postId: string, emoji: AllowedPostReactionEmoji): void => {
		reactionMutation.mutate({ postId, emoji });
	};

	const isInitialLoading = postsQuery.isPending;
	const isEmpty = !isInitialLoading && allPosts.length === 0;

	if (isEmpty && selectedYear === null && total === 0 && !postsQuery.isError) {
		return null;
	}

	return (
		<section className="flex flex-col gap-5">
			<header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="eyebrow text-(--color-brand-accent)">Дневник</p>
					<h2 className="mt-1 flex items-center gap-2 text-2xl font-black text-(--color-text-primary) md:text-3xl">
						<BookOpen className="h-6 w-6 text-(--color-brand-accent)" />
						История {animalName}
					</h2>
				</div>
			</header>

			{availableYears.length > 0 && (
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setSelectedYear(null)}
						className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
							selectedYear === null
								? 'bg-(--color-brand-accent) text-white shadow-[0_8px_18px_rgba(254,134,81,0.30)]'
								: 'border border-(--color-border-soft) bg-(--color-surface-primary) text-(--color-text-secondary) hover:text-(--color-text-primary)'
						}`}>
						Все
					</button>
					{availableYears.map((year) => (
						<button
							key={year}
							type="button"
							onClick={() => setSelectedYear(year)}
							className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
								selectedYear === year
									? 'bg-(--color-brand-accent) text-white shadow-[0_8px_18px_rgba(254,134,81,0.30)]'
									: 'border border-(--color-border-soft) bg-(--color-surface-primary) text-(--color-text-secondary) hover:text-(--color-text-primary)'
							}`}>
							{year}
						</button>
					))}
				</div>
			)}

			<div className="relative">
				<div
					aria-hidden
					className="pointer-events-none absolute hidden h-full sm:block"
					style={{
						left: '131px',
						top: 0,
						width: '2px',
						background:
							'repeating-linear-gradient(to bottom, rgba(254,134,81,0.45) 0 6px, transparent 6px 12px)'
					}}
				/>

				{isInitialLoading && (
					<div className="flex items-center justify-center py-10">
						<Loader2 className="h-6 w-6 animate-spin text-(--color-brand-accent)" />
					</div>
				)}

				{postsQuery.isError && (
					<div className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-6 text-center text-sm text-(--color-text-secondary)">
						Не удалось загрузить дневник.
						<button
							type="button"
							onClick={() => postsQuery.refetch()}
							className="ml-2 font-bold text-(--color-brand-accent) underline-offset-4 hover:underline">
							Повторить
						</button>
					</div>
				)}

				{!isInitialLoading && !postsQuery.isError && allPosts.length === 0 && (
					<div className="rounded-3xl border border-dashed border-(--color-border-soft) bg-(--color-surface-primary)/60 px-6 py-10 text-center">
						<p className="text-sm font-semibold text-(--color-text-primary)">
							В этом году записей пока нет
						</p>
						<p className="mt-1 text-xs text-(--color-text-secondary)">
							Кураторы скоро поделятся новостями о {animalName}.
						</p>
					</div>
				)}

				{allPosts.length > 0 && (
					<ol className="flex flex-col gap-6 sm:gap-8">
						{allPosts.map((post) => (
							<li key={post.id}>
								<PostTimelineCard
									post={post}
									animalName={animalName}
									onOpen={() => setOpenPostId(post.id)}
									onReact={(emoji) => handleReact(post.id, emoji)}
								/>
							</li>
						))}
					</ol>
				)}

				{postsQuery.hasNextPage && (
					<div className="mt-6 flex justify-center">
						<button
							type="button"
							onClick={() => postsQuery.fetchNextPage()}
							disabled={postsQuery.isFetchingNextPage}
							className="inline-flex h-11 items-center gap-2 rounded-full border border-(--color-border-soft) bg-(--color-surface-primary) px-6 text-sm font-bold text-(--color-text-primary) transition-colors hover:bg-(--color-surface-secondary) disabled:opacity-60">
							{postsQuery.isFetchingNextPage ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Загружаем…
								</>
							) : (
								'Показать ещё'
							)}
						</button>
					</div>
				)}
			</div>

			<PostDetailsModal
				postId={openPostId}
				animalName={animalName}
				onClose={() => setOpenPostId(null)}
				onReact={handleReact}
			/>
		</section>
	);
};
