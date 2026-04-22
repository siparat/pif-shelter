import { PostMediaTypeEnum } from '@pif/shared';
import { ImageOff, Play } from 'lucide-react';
import { JSX, useState } from 'react';
import { cn } from '../../../../shared/lib';
import { getMediaUrl } from '../../../../shared/lib';

interface MediaItem {
	id?: string;
	storageKey: string;
	type: PostMediaTypeEnum;
	order?: number;
}

interface Props {
	items: MediaItem[];
	maxVisible?: number;
	aspect?: 'square' | 'video' | 'auto';
	className?: string;
}

const getGridLayout = (visibleCount: number): string => {
	if (visibleCount === 1) return 'grid-cols-1';
	if (visibleCount === 2) return 'grid-cols-2';
	if (visibleCount === 3) return 'grid-cols-2 grid-rows-2';
	return 'grid-cols-2 grid-rows-2';
};

export const PostMediaPreview = ({ items, maxVisible = 4, aspect = 'video', className }: Props): JSX.Element | null => {
	const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

	if (items.length === 0) {
		return null;
	}

	const visible = items.slice(0, maxVisible);
	const overflow = items.length - visible.length;

	const markBroken = (key: string): void => {
		setBrokenIds((prev) => {
			if (prev.has(key)) return prev;
			const next = new Set(prev);
			next.add(key);
			return next;
		});
	};

	const aspectClass = aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : '';

	return (
		<div
			className={cn(
				'grid gap-1.5 rounded-xl overflow-hidden bg-(--color-bg-primary) border border-(--color-border)',
				getGridLayout(visible.length),
				className
			)}>
			{visible.map((item, index) => {
				const key = item.id ?? `${item.storageKey}-${index}`;
				const isBroken = brokenIds.has(key);
				const isVideo = item.type === PostMediaTypeEnum.VIDEO;
				const isSpanFirst = visible.length === 3 && index === 0;
				const isLast = index === visible.length - 1;
				const showOverlayCount = overflow > 0 && isLast;
				const src = getMediaUrl(item.storageKey);

				return (
					<div
						key={key}
						className={cn(
							'relative overflow-hidden bg-(--color-bg-primary)',
							aspectClass,
							isSpanFirst && 'row-span-2'
						)}>
						{isBroken ? (
							<div className="absolute inset-0 flex items-center justify-center text-(--color-text-secondary)">
								<ImageOff size={28} />
							</div>
						) : isVideo ? (
							<>
								<video
									src={src}
									className="absolute inset-0 w-full h-full object-cover"
									muted
									playsInline
									preload="metadata"
									onError={() => markBroken(key)}
								/>
								<div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
									<div className="rounded-full bg-black/60 p-2">
										<Play className="text-white" size={22} fill="currentColor" />
									</div>
								</div>
							</>
						) : (
							<img
								src={src}
								alt=""
								loading="lazy"
								className="absolute inset-0 w-full h-full object-cover"
								onError={() => markBroken(key)}
							/>
						)}

						{showOverlayCount && (
							<div className="absolute inset-0 flex items-center justify-center bg-black/55">
								<span className="text-white text-xl font-bold">+{overflow}</span>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};
