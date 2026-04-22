import { ImageOff, Images, Pencil } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../shared/config';
import { getMediaUrl } from '../../../../shared/lib';
import { AnimalGalleryLightbox } from './AnimalGalleryLightbox';

interface Props {
	animalId: string;
	urls: string[] | null;
	canEdit: boolean;
}

const resolveSrc = (url: string): string =>
	url.startsWith('http') || url.startsWith('blob:') ? url : getMediaUrl(url);

export const AnimalGallery = ({ animalId, urls, canEdit }: Props): JSX.Element | null => {
	const navigate = useNavigate();
	const items = useMemo(() => urls?.filter((url) => url.trim().length > 0) ?? [], [urls]);
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const [brokenSet, setBrokenSet] = useState<Set<string>>(new Set());

	const goToEditor = (): void => {
		navigate(`${ROUTES.animalEdit.replace(':id', animalId)}#gallery`);
	};

	if (items.length === 0) {
		if (!canEdit) {
			return null;
		}
		return (
			<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-3">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-xl font-semibold">Галерея</h2>
				</div>
				<div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
					<Images size={36} className="text-(--color-text-secondary)" />
					<p className="text-sm text-(--color-text-secondary) max-w-md">
						Галерея пока пуста. Добавьте фотографии, чтобы рассказать историю животного.
					</p>
					<button
						type="button"
						onClick={goToEditor}
						className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-bg-primary) px-4 py-2 text-sm font-semibold hover:border-(--color-brand-orange) hover:text-(--color-brand-orange) transition-colors">
						<Pencil size={14} />
						Добавить фото
					</button>
				</div>
			</section>
		);
	}

	const markBroken = (url: string): void => {
		setBrokenSet((prev) => {
			if (prev.has(url)) {
				return prev;
			}
			const next = new Set(prev);
			next.add(url);
			return next;
		});
	};

	return (
		<section className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-xl font-semibold">Галерея</h2>
				<div className="flex items-center gap-3">
					<span className="text-xs text-(--color-text-secondary)">
						{items.length} {items.length === 1 ? 'фото' : 'фото'}
					</span>
					{canEdit && (
						<button
							type="button"
							onClick={goToEditor}
							className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-bg-primary) px-3 py-1.5 text-xs font-semibold hover:border-(--color-brand-orange) hover:text-(--color-brand-orange) transition-colors"
							aria-label="Редактировать галерею">
							<Pencil size={12} />
							Редактировать
						</button>
					)}
				</div>
			</div>
			<ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
				{items.map((url, index) => {
					const isBroken = brokenSet.has(url);
					return (
						<li key={`${url}-${index}`}>
							<button
								type="button"
								aria-label={`Открыть фото ${index + 1} из ${items.length}`}
								onClick={() => setOpenIndex(index)}
								className="group relative block w-full aspect-square overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-primary) focus:outline-none focus:ring-2 focus:ring-(--color-brand-orange)">
								{isBroken ? (
									<div className="absolute inset-0 flex items-center justify-center text-(--color-text-secondary)">
										<ImageOff size={32} />
									</div>
								) : (
									<img
										src={resolveSrc(url)}
										alt={`Фото ${index + 1}`}
										loading="lazy"
										onError={() => markBroken(url)}
										className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
									/>
								)}
							</button>
						</li>
					);
				})}
			</ul>
			{openIndex !== null && (
				<AnimalGalleryLightbox urls={items} initialIndex={openIndex} onClose={() => setOpenIndex(null)} />
			)}
		</section>
	);
};
