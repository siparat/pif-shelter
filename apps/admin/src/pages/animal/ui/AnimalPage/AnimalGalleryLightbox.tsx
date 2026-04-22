import { ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import { JSX, MouseEvent, TouchEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn, getMediaUrl } from '../../../../shared/lib';

interface Props {
	urls: string[];
	initialIndex: number;
	onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

const resolveSrc = (url: string): string =>
	url.startsWith('http') || url.startsWith('blob:') ? url : getMediaUrl(url);

export const AnimalGalleryLightbox = ({ urls, initialIndex, onClose }: Props): JSX.Element | null => {
	const [index, setIndex] = useState<number>(() => Math.min(Math.max(initialIndex, 0), urls.length - 1));
	const [isBroken, setIsBroken] = useState<boolean>(false);
	const closeButtonRef = useRef<HTMLButtonElement | null>(null);
	const touchStartXRef = useRef<number | null>(null);

	const goPrev = useCallback((): void => {
		setIsBroken(false);
		setIndex((current) => (current - 1 + urls.length) % urls.length);
	}, [urls.length]);

	const goNext = useCallback((): void => {
		setIsBroken(false);
		setIndex((current) => (current + 1) % urls.length);
	}, [urls.length]);

	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeButtonRef.current?.focus();
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') {
				onClose();
			} else if (event.key === 'ArrowLeft') {
				goPrev();
			} else if (event.key === 'ArrowRight') {
				goNext();
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [goNext, goPrev, onClose]);

	const handleBackdropClick = (event: MouseEvent<HTMLDivElement>): void => {
		if (event.target === event.currentTarget) {
			onClose();
		}
	};

	const handleTouchStart = (event: TouchEvent<HTMLDivElement>): void => {
		touchStartXRef.current = event.touches[0]?.clientX ?? null;
	};

	const handleTouchEnd = (event: TouchEvent<HTMLDivElement>): void => {
		const startX = touchStartXRef.current;
		touchStartXRef.current = null;
		if (startX === null) {
			return;
		}
		const endX = event.changedTouches[0]?.clientX ?? startX;
		const diff = endX - startX;
		if (Math.abs(diff) < SWIPE_THRESHOLD || urls.length < 2) {
			return;
		}
		if (diff > 0) {
			goPrev();
		} else {
			goNext();
		}
	};

	if (typeof document === 'undefined' || urls.length === 0) {
		return null;
	}

	const currentUrl = urls[index];
	const previousUrl = urls[(index - 1 + urls.length) % urls.length];
	const nextUrl = urls[(index + 1) % urls.length];

	return createPortal(
		<div
			role="dialog"
			aria-modal="true"
			aria-label={`Просмотр фото ${index + 1} из ${urls.length}`}
			onClick={handleBackdropClick}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm">
			<button
				ref={closeButtonRef}
				type="button"
				aria-label="Закрыть"
				onClick={onClose}
				className="absolute top-3 right-3 rounded-full p-2 text-white/90 hover:bg-white/10 transition-colors">
				<X size={22} />
			</button>

			<div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-white/80 rounded-full bg-white/10 px-3 py-1">
				{index + 1} / {urls.length}
			</div>

			{urls.length > 1 && (
				<>
					<button
						type="button"
						aria-label="Предыдущее фото"
						onClick={goPrev}
						className="absolute left-2 md:left-4 rounded-full p-2 text-white/90 hover:bg-white/10 transition-colors">
						<ChevronLeft size={28} />
					</button>
					<button
						type="button"
						aria-label="Следующее фото"
						onClick={goNext}
						className="absolute right-2 md:right-4 rounded-full p-2 text-white/90 hover:bg-white/10 transition-colors">
						<ChevronRight size={28} />
					</button>
				</>
			)}

			<div className="flex items-center justify-center max-w-[95vw] max-h-[85vh]">
				{isBroken ? (
					<div className="flex flex-col items-center gap-2 text-white/70 p-12 bg-white/5 rounded-2xl">
						<ImageOff size={48} />
						<p className="text-sm">Изображение недоступно</p>
					</div>
				) : (
					<img
						key={currentUrl}
						src={resolveSrc(currentUrl)}
						alt={`Фото ${index + 1} из ${urls.length}`}
						className={cn('max-w-[95vw] max-h-[85vh] object-contain rounded-xl shadow-2xl')}
						onError={() => setIsBroken(true)}
					/>
				)}
			</div>

			{urls.length > 1 && (
				<>
					<img src={resolveSrc(previousUrl)} alt="" aria-hidden="true" className="hidden" />
					<img src={resolveSrc(nextUrl)} alt="" aria-hidden="true" className="hidden" />
				</>
			)}
		</div>,
		document.body
	);
};
