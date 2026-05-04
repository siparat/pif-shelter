import { PostMediaTypeEnum } from '@pif/shared';
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from 'lucide-react';
import { JSX, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { getMediaUrl } from '../../../../../../shared/lib/get-media-url';
import { PostListItem } from '../../../../../../entities/post';

type Props = {
	media: PostListItem['media'];
	alt: string;
};

export const PostMediaGallery = ({ media, alt }: Props): JSX.Element => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const items = media.slice().sort((a, b) => a.order - b.order);
	const safeIndex = Math.min(activeIndex, Math.max(0, items.length - 1));
	const active = items[safeIndex];

	const open = useCallback((): void => {
		dialogRef.current?.showModal();
		setLightboxOpen(true);
	}, []);

	const close = useCallback((): void => {
		dialogRef.current?.close();
		setLightboxOpen(false);
	}, []);

	const goPrev = useCallback((): void => {
		setActiveIndex((i) => (i - 1 + items.length) % items.length);
	}, [items.length]);

	const goNext = useCallback((): void => {
		setActiveIndex((i) => (i + 1) % items.length);
	}, [items.length]);

	const onKeyDown = useCallback(
		(e: KeyboardEvent<HTMLDialogElement>): void => {
			if (e.key === 'ArrowLeft') goPrev();
			if (e.key === 'ArrowRight') goNext();
		},
		[goPrev, goNext]
	);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		const onClose = (): void => setLightboxOpen(false);
		dialog.addEventListener('close', onClose);
		return () => dialog.removeEventListener('close', onClose);
	}, []);

	if (!active) {
		return (
			<div className="flex h-48 items-center justify-center rounded-2xl bg-(--color-brand-brown-soft) text-(--color-text-secondary)">
				<ImageOff className="h-8 w-8" />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="group relative max-h-[80vh] aspect-4/3 overflow-hidden rounded-2xl bg-(--color-brand-brown-soft) shadow-[0_12px_28px_rgba(79,61,56,0.10)]">
				{active.type === PostMediaTypeEnum.VIDEO ? (
					<video
						src={getMediaUrl(active.storageKey)}
						controls
						className="h-full w-full object-cover"
						preload="metadata"
					/>
				) : (
					<>
						<img
							src={getMediaUrl(active.storageKey)}
							alt={alt}
							className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
							loading="lazy"
						/>
						<button
							type="button"
							onClick={open}
							aria-label="Открыть фото"
							className="absolute inset-0 flex cursor-zoom-in items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
							<span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
								<ZoomIn className="h-5 w-5 text-white" />
							</span>
						</button>
					</>
				)}

				{items.length > 1 && (
					<>
						<button
							type="button"
							onClick={goPrev}
							aria-label="Предыдущее"
							className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-(--color-text-primary) shadow-md backdrop-blur transition-all hover:bg-white">
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={goNext}
							aria-label="Следующее"
							className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-(--color-text-primary) shadow-md backdrop-blur transition-all hover:bg-white">
							<ChevronRight className="h-5 w-5" />
						</button>
					</>
				)}
			</div>

			{items.length > 1 && (
				<div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
					{items.map((item, i) => {
						const isActive = i === safeIndex;
						return (
							<button
								key={item.id}
								type="button"
								onClick={() => setActiveIndex(i)}
								className={`relative aspect-square h-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-16 ${
									isActive
										? 'border-(--color-brand-accent) opacity-100'
										: 'border-transparent opacity-70 hover:opacity-100'
								}`}>
								{item.type === PostMediaTypeEnum.VIDEO ? (
									<div className="flex h-full w-full items-center justify-center bg-(--color-brand-brown-muted) text-[10px] font-bold text-(--color-text-secondary)">
										VIDEO
									</div>
								) : (
									<img
										src={getMediaUrl(item.storageKey)}
										alt=""
										className="h-full w-full object-cover"
										loading="lazy"
									/>
								)}
							</button>
						);
					})}
				</div>
			)}

			<dialog
				ref={dialogRef}
				onKeyDown={onKeyDown}
				className="fixed inset-0 z-200 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-md">
				{lightboxOpen && active.type !== PostMediaTypeEnum.VIDEO && (
					<div
						className="flex h-full w-full items-center justify-center px-4 py-16 sm:px-20"
						onClick={(e) => e.target === e.currentTarget && close()}>
						<img
							src={getMediaUrl(active.storageKey)}
							alt={alt}
							className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_32px_64px_rgba(0,0,0,0.6)]"
						/>
						<button
							type="button"
							onClick={close}
							aria-label="Закрыть"
							className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6 sm:top-6">
							<X className="h-5 w-5" />
						</button>
						{items.length > 1 && (
							<>
								<button
									type="button"
									onClick={goPrev}
									aria-label="Предыдущее"
									className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:left-6">
									<ChevronLeft className="h-6 w-6" />
								</button>
								<button
									type="button"
									onClick={goNext}
									aria-label="Следующее"
									className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:right-6">
									<ChevronRight className="h-6 w-6" />
								</button>
							</>
						)}
					</div>
				)}
			</dialog>
		</div>
	);
};
