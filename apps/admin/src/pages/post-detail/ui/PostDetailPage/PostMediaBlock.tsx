import { PostMediaTypeEnum } from '@pif/shared';
import { ImageOff } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { AnimalGalleryLightbox } from '../../../animal/ui/AnimalPage/AnimalGalleryLightbox';
import { cn, getMediaUrl } from '../../../../shared/lib';

interface MediaItem {
	id: string;
	storageKey: string;
	type: PostMediaTypeEnum;
	order: number;
}

interface Props {
	items: MediaItem[];
}

export const PostMediaBlock = ({ items }: Props): JSX.Element | null => {
	const [openPhotoIndex, setOpenPhotoIndex] = useState<number | null>(null);
	const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

	const photos = useMemo(() => items.filter((item) => item.type === PostMediaTypeEnum.IMAGE), [items]);
	const videos = useMemo(() => items.filter((item) => item.type === PostMediaTypeEnum.VIDEO), [items]);
	const photoKeys = useMemo(() => photos.map((p) => p.storageKey), [photos]);

	if (items.length === 0) {
		return null;
	}

	const markBroken = (id: string): void => {
		setBrokenIds((prev) => {
			if (prev.has(id)) return prev;
			const next = new Set(prev);
			next.add(id);
			return next;
		});
	};

	const photoGridClass =
		photos.length === 1 ? 'grid-cols-1' : photos.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3';

	return (
		<div className="space-y-4">
			{photos.length > 0 && (
				<ul className={cn('grid gap-2 md:gap-3', photoGridClass)}>
					{photos.map((photo, index) => {
						const isBroken = brokenIds.has(photo.id);
						return (
							<li key={photo.id}>
								<button
									type="button"
									onClick={() => setOpenPhotoIndex(index)}
									className="group relative block w-full aspect-square overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-primary) focus:outline-none focus:ring-2 focus:ring-(--color-brand-orange)">
									{isBroken ? (
										<div className="absolute inset-0 flex items-center justify-center text-(--color-text-secondary)">
											<ImageOff size={28} />
										</div>
									) : (
										<img
											src={getMediaUrl(photo.storageKey)}
											alt=""
											loading="lazy"
											onError={() => markBroken(photo.id)}
											className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
										/>
									)}
								</button>
							</li>
						);
					})}
				</ul>
			)}

			{videos.length > 0 && (
				<ul className="space-y-3">
					{videos.map((video) => (
						<li
							key={video.id}
							className="rounded-xl overflow-hidden border border-(--color-border) bg-black">
							<video
								src={getMediaUrl(video.storageKey)}
								controls
								playsInline
								preload="metadata"
								className="w-full max-h-[70vh] bg-black"
							/>
						</li>
					))}
				</ul>
			)}

			{openPhotoIndex !== null && photoKeys.length > 0 && (
				<AnimalGalleryLightbox
					urls={photoKeys}
					initialIndex={openPhotoIndex}
					onClose={() => setOpenPhotoIndex(null)}
				/>
			)}
		</div>
	);
};
