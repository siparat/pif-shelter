import { PostVisibilityEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { CalendarDays, Lock, Unlock, User } from 'lucide-react';
import { JSX, ReactNode } from 'react';
import { cn } from '../../../../shared/lib';
import { PostItem } from '../../model/types';
import { PostMediaPreview } from '../PostMediaPreview/PostMediaPreview';

interface Props {
	post: PostItem;
	authorName?: string | null;
	onOpen?: () => void;
	actionsSlot?: ReactNode;
	className?: string;
}

const formatAgeAtPost = (years: number, months: number): string | null => {
	if (years === 0 && months === 0) {
		return null;
	}
	const parts: string[] = [];
	if (years > 0) {
		parts.push(`${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`);
	}
	if (months > 0) {
		parts.push(`${months} ${months === 1 ? 'мес' : 'мес'}`);
	}
	return parts.join(' ');
};

export const PostCard = ({ post, authorName, onOpen, actionsSlot, className }: Props): JSX.Element => {
	const isPrivate = post.visibility === PostVisibilityEnum.PRIVATE;
	const totalReactions = post.reactions.reduce((sum, r) => sum + r.count, 0);
	const ageLabel = formatAgeAtPost(post.animalAgeYears, post.animalAgeMonths % 12);

	return (
		<article
			className={cn(
				'group relative rounded-2xl border border-(--color-border) bg-(--color-bg-primary) overflow-hidden transition-colors',
				onOpen && 'hover:border-(--color-brand-orange) cursor-pointer',
				className
			)}>
			{onOpen && (
				<button
					type="button"
					aria-label={`Открыть пост: ${post.title}`}
					onClick={onOpen}
					className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand-orange) focus-visible:ring-inset"
				/>
			)}

			<div className="relative z-10 p-4 space-y-3 pointer-events-none">
				<header className="flex items-start justify-between gap-3">
					<div className="min-w-0 space-y-1">
						<h3 className="text-base md:text-lg font-semibold leading-snug break-words line-clamp-2">
							{post.title}
						</h3>
						<div className="flex flex-wrap items-center gap-2 text-xs text-(--color-text-secondary)">
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
							</span>
							{authorName && (
								<span className="inline-flex items-center gap-1">
									<User size={12} />
									{authorName}
								</span>
							)}
							{ageLabel && (
								<span className="text-(--color-text-secondary)/80" title="Возраст на момент поста">
									· {ageLabel}
								</span>
							)}
						</div>
					</div>

					{actionsSlot && <div className="pointer-events-auto shrink-0">{actionsSlot}</div>}
				</header>

				{post.media.length > 0 && (
					<PostMediaPreview
						items={post.media}
						maxVisible={4}
						aspect="video"
						className="pointer-events-none"
					/>
				)}

				{totalReactions > 0 && (
					<footer className="flex flex-wrap items-center gap-2 pt-1">
						{post.reactions
							.filter((r) => r.count > 0)
							.map((r) => (
								<span
									key={r.emoji}
									className={cn(
										'inline-flex items-center gap-1 rounded-full border border-(--color-border) bg-(--color-bg-secondary) px-2 py-0.5 text-xs',
										r.isActive && 'border-(--color-brand-orange) text-(--color-brand-orange)'
									)}
									title={r.isActive ? 'Ваша реакция' : undefined}>
									<span className="text-sm leading-none">{r.emoji}</span>
									<span>{r.count}</span>
								</span>
							))}
					</footer>
				)}
			</div>
		</article>
	);
};
