import { AllowedPostReactionEmoji } from '@pif/shared';
import { Loader2, X } from 'lucide-react';
import { JSX, useEffect, useRef } from 'react';
import { usePostDetailsQuery } from '../../../../../../entities/post';
import { formatAgeAtPost, formatTimelineDate } from './format';
import { PostMediaGallery } from './PostMediaGallery';
import { ReactionsBar } from './ReactionsBar';

type Props = {
	postId: string | null;
	animalName: string;
	onClose: () => void;
	onReact: (postId: string, emoji: AllowedPostReactionEmoji) => void;
};

export const PostDetailsModal = ({ postId, animalName, onClose, onReact }: Props): JSX.Element => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const query = usePostDetailsQuery(postId);
	const post = query.data;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (postId) {
			if (!dialog.open) dialog.showModal();
		} else {
			if (dialog.open) dialog.close();
		}
	}, [postId]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		const handleClose = (): void => onClose();
		dialog.addEventListener('close', handleClose);
		return () => dialog.removeEventListener('close', handleClose);
	}, [onClose]);

	const dateInfo = post ? formatTimelineDate(post.createdAt) : null;
	const ageLabel = post ? formatAgeAtPost(post.animalAgeYears, post.animalAgeMonths) : null;

	return (
		<dialog
			ref={dialogRef}
			onClick={(e) => {
				if (e.target === dialogRef.current) {
					dialogRef.current?.close();
				}
			}}
			className="m-auto w-[min(92vw,720px)] rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm">
			<div className="max-h-[85vh] overflow-y-auto">
				<button
					type="button"
					onClick={() => dialogRef.current?.close()}
					aria-label="Закрыть"
					className="sticky top-3 z-10 ml-auto mr-3 mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-(--color-brand-brown) text-white shadow-lg transition-colors hover:bg-(--color-brand-brown-strong)">
					<X className="h-4 w-4" />
				</button>

				{query.isPending && (
					<div className="flex h-60 items-center justify-center">
						<Loader2 className="h-6 w-6 animate-spin text-(--color-brand-accent)" />
					</div>
				)}

				{query.isError && (
					<div className="px-6 py-10 text-center text-sm text-(--color-text-secondary)">
						Не удалось загрузить пост.
					</div>
				)}

				{post && dateInfo && (
					<article className="space-y-5 px-5 pb-6 sm:px-7">
						<header className="space-y-2">
							<div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--color-text-secondary)">
								<span className="rounded-full bg-(--color-brand-accent)/15 px-3 py-1 text-(--color-brand-accent)">
									{dateInfo.full}
								</span>
								{ageLabel && (
									<span className="rounded-full bg-(--color-brand-brown-soft) px-3 py-1">
										{animalName}: {ageLabel}
									</span>
								)}
							</div>
							<h2 className="text-2xl font-black leading-tight text-(--color-text-primary) md:text-3xl">
								{post.title}
							</h2>
						</header>

						{post.media.length > 0 && <PostMediaGallery media={post.media} alt={post.title} />}

						{post.body && (
							<div
								className="post-body whitespace-pre-line text-sm leading-relaxed text-(--color-text-primary) md:text-base"
								dangerouslySetInnerHTML={{ __html: post.body }}
							/>
						)}

						<div className="flex items-center justify-between gap-3 border-t border-(--color-border-soft) pt-4">
							<ReactionsBar reactions={post.reactions} onReact={(emoji) => onReact(post.id, emoji)} />
						</div>
					</article>
				)}
			</div>
		</dialog>
	);
};
