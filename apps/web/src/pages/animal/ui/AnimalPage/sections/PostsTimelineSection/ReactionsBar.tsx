import { ALLOWED_POST_REACTION_EMOJIS, AllowedPostReactionEmoji } from '@pif/shared';
import { JSX, useState } from 'react';
import { PostListItem } from '../../../../../../entities/post';

type Props = {
	reactions: PostListItem['reactions'];
	onReact: (emoji: AllowedPostReactionEmoji) => void;
	disabled?: boolean;
};

export const ReactionsBar = ({ reactions, onReact, disabled }: Props): JSX.Element => {
	const [pickerOpen, setPickerOpen] = useState(false);

	const map = new Map(reactions.map((r) => [r.emoji, r] as const));
	const visible = reactions.filter((r) => r.count > 0 || r.isActive);

	const handlePick = (emoji: AllowedPostReactionEmoji): void => {
		setPickerOpen(false);
		onReact(emoji);
	};

	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{visible.map((r) => (
				<button
					key={r.emoji}
					type="button"
					disabled={disabled}
					onClick={() => onReact(r.emoji as AllowedPostReactionEmoji)}
					className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-all hover:-translate-y-0.5 active:scale-95 ${
						r.isActive
							? 'border-(--color-brand-accent) bg-(--color-brand-accent)/10 text-(--color-brand-accent) shadow-[0_4px_12px_rgba(254,134,81,0.18)]'
							: 'border-(--color-border-soft) bg-(--color-surface-primary) text-(--color-text-primary)'
					}`}>
					<span className="text-base leading-none">{r.emoji}</span>
					<span>{r.count}</span>
				</button>
			))}

			<div className="relative">
				<button
					type="button"
					disabled={disabled}
					onClick={() => setPickerOpen((v) => !v)}
					aria-label="Добавить реакцию"
					className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-(--color-border-soft) bg-(--color-surface-primary) text-(--color-text-secondary) transition-colors hover:border-(--color-brand-accent) hover:text-(--color-brand-accent)">
					<span className="text-sm leading-none">+</span>
				</button>
				{pickerOpen && (
					<>
						<div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} aria-hidden />
						<div className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-full border border-(--color-border-soft) bg-(--color-surface-primary) p-1.5 shadow-[0_12px_28px_rgba(79,61,56,0.18)]">
							{ALLOWED_POST_REACTION_EMOJIS.map((emoji) => {
								const isActive = map.get(emoji)?.isActive ?? false;
								return (
									<button
										key={emoji}
										type="button"
										onClick={() => handlePick(emoji)}
										className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform hover:scale-125 active:scale-95 ${
											isActive ? 'bg-(--color-brand-accent)/15' : ''
										}`}>
										{emoji}
									</button>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
