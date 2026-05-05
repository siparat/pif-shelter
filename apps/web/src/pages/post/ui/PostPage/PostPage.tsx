import { AllowedPostReactionEmoji } from '@pif/shared';
import { BookOpen, Loader2, PawPrint } from 'lucide-react';
import { JSX } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePostDetailsQuery, useSetPostReactionMutation } from '../../../../entities/post';
import { ROUTES } from '../../../../shared/config/routes';
import { PostMediaGallery } from '../../../animal/ui/AnimalPage/sections/PostsTimelineSection/PostMediaGallery';
import { ReactionsBar } from '../../../animal/ui/AnimalPage/sections/PostsTimelineSection/ReactionsBar';
import {
	formatAgeAtPost,
	formatTimelineDate
} from '../../../animal/ui/AnimalPage/sections/PostsTimelineSection/format';

const PostPage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const query = usePostDetailsQuery(id ?? null);
	const reactionMutation = useSetPostReactionMutation('', null);
	const post = query.data;

	const handleReact = (emoji: AllowedPostReactionEmoji): void => {
		if (!id) return;
		reactionMutation.mutate({ postId: id, emoji });
	};

	const dateInfo = post ? formatTimelineDate(post.createdAt) : null;
	const ageLabel = post ? formatAgeAtPost(post.animalAgeYears, post.animalAgeMonths) : null;

	return (
		<div className="min-h-screen bg-(--color-bg-soft) text-(--color-text-primary)">
			<div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
				<div className="mb-6 flex items-center gap-2 text-sm text-(--color-text-secondary)">
					<Link
						to={ROUTES.home}
						className="flex items-center gap-1.5 font-semibold text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)">
						<PawPrint className="h-4 w-4" />
						Приют
					</Link>
					<span>/</span>
					<span className="flex items-center gap-1.5">
						<BookOpen className="h-4 w-4" />
						Дневник
					</span>
				</div>

				{query.isPending && (
					<div className="flex h-60 items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-(--color-brand-accent)" />
					</div>
				)}

				{query.isError && (
					<div className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-8 text-center shadow-[0_12px_36px_rgba(79,61,56,0.08)]">
						<p className="font-semibold text-(--color-text-primary)">Запись не найдена</p>
						<p className="mt-1 text-sm text-(--color-text-secondary)">
							Возможно, ссылка устарела или запись была удалена.
						</p>
						<Link
							to={ROUTES.home}
							className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-(--color-brand-brown) px-5 text-sm font-bold text-(--color-text-on-dark)">
							На главную
						</Link>
					</div>
				)}

				{post && dateInfo && (
					<article className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) shadow-[0_12px_36px_rgba(79,61,56,0.08)]">
						<div className="space-y-5 px-5 py-6 sm:px-7 sm:py-8">
							<header className="space-y-2">
								<div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
									<span className="rounded-full bg-(--color-brand-accent)/15 px-3 py-1 text-(--color-brand-accent)">
										{dateInfo.full}
									</span>
									{ageLabel && (
										<span className="rounded-full bg-(--color-brand-brown-soft) px-3 py-1">
											{ageLabel}
										</span>
									)}
								</div>
								<h1 className="text-2xl font-black leading-tight text-(--color-text-primary) md:text-3xl">
									{post.title}
								</h1>
							</header>

							{post.media.length > 0 && <PostMediaGallery media={post.media} alt={post.title} />}

							{post.body && (
								<div
									className="post-body whitespace-pre-line text-sm leading-relaxed text-(--color-text-primary) md:text-base"
									dangerouslySetInnerHTML={{ __html: post.body }}
								/>
							)}

							<div className="flex items-center justify-between gap-3 border-t border-(--color-border-soft) pt-4">
								<ReactionsBar reactions={post.reactions} onReact={handleReact} />
							</div>
						</div>
					</article>
				)}
			</div>
		</div>
	);
};

export default PostPage;
