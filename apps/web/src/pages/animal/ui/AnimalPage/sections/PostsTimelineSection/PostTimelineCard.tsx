import { AllowedPostReactionEmoji } from '@pif/shared';
import { ArrowRight } from 'lucide-react';
import { JSX } from 'react';
import { PostListItem } from '../../../../../../entities/post';
import { formatAgeAtPost, formatTimelineDate } from './format';
import { PostMediaGallery } from './PostMediaGallery';
import { ReactionsBar } from './ReactionsBar';

type Props = {
	post: PostListItem;
	animalName: string;
	onOpen: () => void;
	onReact: (emoji: AllowedPostReactionEmoji) => void;
};

export const PostTimelineCard = ({ post, animalName, onOpen, onReact }: Props): JSX.Element => {
	const date = formatTimelineDate(post.createdAt);
	const ageLabel = formatAgeAtPost(post.animalAgeYears, post.animalAgeMonths);

	return (
		<div className="relative grid grid-cols-1 gap-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6">
			<span
				aria-hidden
				className="absolute top-2 hidden h-3.5 w-3.5 rounded-full border-2 border-(--color-bg-primary) bg-(--color-brand-accent) shadow-[0_0_0_3px_rgba(254,134,81,0.18)] sm:block"
				style={{ left: '125px' }}
			/>
			<div className="flex sm:flex-col sm:items-end sm:pt-2">
				<div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
					<div className="text-[11px] font-bold uppercase tracking-widest text-(--color-text-secondary) sm:hidden">
						{date.full}
					</div>
					<div className="hidden sm:block">
						<div className="text-2xl font-black leading-none text-(--color-brand-accent)">{date.day}</div>
						<div className="mt-1 text-xs font-bold uppercase tracking-widest text-(--color-text-primary)">
							{date.month} {date.year}
						</div>
					</div>
					{ageLabel && (
						<div className="hidden text-[11px] font-semibold text-(--color-text-secondary) sm:block">
							{animalName}: {ageLabel}
						</div>
					)}
				</div>
			</div>

			<article className="rounded-3xl border border-(--color-border-soft) bg-(--color-surface-primary) p-4 shadow-[0_8px_24px_rgba(79,61,56,0.06)] transition-shadow hover:shadow-[0_14px_32px_rgba(79,61,56,0.10)] sm:p-5">
				<header className="mb-3">
					<h3 className="text-lg font-black leading-tight text-(--color-text-primary) md:text-xl">
						{post.title}
					</h3>
					{ageLabel && (
						<p className="mt-1 text-xs font-semibold text-(--color-text-secondary) sm:hidden">
							{animalName}: {ageLabel}
						</p>
					)}
				</header>

				{post.media.length > 0 && (
					<div className="mb-4">
						<PostMediaGallery media={post.media} alt={post.title} />
					</div>
				)}

				<button
					type="button"
					onClick={onOpen}
					className="group inline-flex items-center gap-2 rounded-full bg-(--color-brand-accent-strong) px-5 py-2.5 text-sm font-bold text-(--color-text-primary) transition-all hover:bg-(--color-brand-accent) hover:text-white active:scale-[0.985]">
					Читать полностью
					<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
				</button>

				<div className="mt-4 border-t border-dashed border-(--color-border-soft) pt-3">
					<ReactionsBar reactions={post.reactions} onReact={onReact} />
				</div>
			</article>
		</div>
	);
};
