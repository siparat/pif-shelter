import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors
} from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ANIMAL_GALLERY_MAX, IMAGE_MIME_TYPES } from '@pif/shared';
import { Images, Loader2, Plus } from 'lucide-react';
import { JSX, useCallback, useId, useMemo, useState } from 'react';
import { cn } from '../../../shared/lib';
import { useGalleryEditor } from '../model/use-gallery-editor';
import { GalleryItemDraft } from '../model/types';
import { RemoveGalleryPhotoConfirm } from './RemoveGalleryPhotoConfirm';
import { SortableGalleryItem } from './SortableGalleryItem';

interface Props {
	animalId: string;
	galleryUrls: string[] | null;
	disabled?: boolean;
}

const ACCEPT = Object.values(IMAGE_MIME_TYPES).join(',');

export const AnimalGalleryEditor = ({ animalId, galleryUrls, disabled }: Props): JSX.Element => {
	const inputId = useId();
	const { items, storedCount, uploadingCount, canAddMore, isSyncing, addFiles, removeItem, reorder, dismissFailed } =
		useGalleryEditor({ animalId, galleryUrls, disabled });

	const [pendingRemoval, setPendingRemoval] = useState<GalleryItemDraft | null>(null);
	const [isDndActive, setIsDndActive] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const sortableIds = useMemo(() => items.map((item) => item.localId), [items]);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setIsDndActive(false);
			const { active, over } = event;
			if (!over || active.id === over.id) return;
			const oldIndex = items.findIndex((item) => item.localId === active.id);
			const newIndex = items.findIndex((item) => item.localId === over.id);
			if (oldIndex < 0 || newIndex < 0) return;
			void reorder(arrayMove(items, oldIndex, newIndex));
		},
		[items, reorder]
	);

	const handleFileInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (files && files.length) {
				void addFiles(files);
			}
			event.target.value = '';
		},
		[addFiles]
	);

	const handleRequestRemove = useCallback(
		(localId: string) => {
			const target = items.find((item) => item.localId === localId);
			if (!target) return;
			if (target.failedFileName) {
				dismissFailed(localId);
				return;
			}
			setPendingRemoval(target);
		},
		[items, dismissFailed]
	);

	const confirmRemoval = useCallback(async () => {
		if (!pendingRemoval) return;
		await removeItem(pendingRemoval.localId);
		setPendingRemoval(null);
	}, [pendingRemoval, removeItem]);

	const uploadDisabled = disabled || !canAddMore;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Images size={20} className="text-(--color-text-secondary)" />
					<h3 className="text-lg md:text-xl font-semibold">Галерея</h3>
				</div>
				<div className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
					{isSyncing && <Loader2 size={14} className="animate-spin" />}
					<span>
						{storedCount} / {ANIMAL_GALLERY_MAX}
					</span>
				</div>
			</div>

			<p className="text-xs text-(--color-text-secondary) leading-relaxed">
				Загрузите до {ANIMAL_GALLERY_MAX} фотографий. Перетаскивайте, чтобы изменить порядок. Фото сохраняются
				автоматически.
			</p>

			{items.length === 0 && !uploadDisabled && (
				<label
					htmlFor={inputId}
					className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-(--color-border) bg-(--color-bg-primary) py-10 px-4 text-(--color-text-secondary) hover:border-(--color-brand-orange) hover:text-(--color-brand-orange) cursor-pointer transition-colors">
					<Plus size={26} />
					<span className="text-sm font-semibold">Добавить первые фото</span>
					<span className="text-xs">Можно выбрать несколько сразу</span>
				</label>
			)}

			{items.length > 0 && (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={() => setIsDndActive(true)}
					onDragCancel={() => setIsDndActive(false)}
					onDragEnd={handleDragEnd}>
					<SortableContext items={sortableIds} strategy={rectSortingStrategy}>
						<div
							className={cn(
								'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 p-2 md:p-3 rounded-xl border border-(--color-border) bg-(--color-bg-primary) transition-colors',
								isDndActive && 'border-(--color-brand-orange)'
							)}>
							{items.map((item, index) => (
								<SortableGalleryItem
									key={item.localId}
									item={item}
									index={index}
									disabled={disabled}
									onRequestRemove={handleRequestRemove}
								/>
							))}

							{!uploadDisabled && (
								<label
									htmlFor={inputId}
									className="flex aspect-square flex-col items-center justify-center gap-1 w-full rounded-xl border-2 border-dashed border-(--color-border) text-(--color-text-secondary) hover:border-(--color-brand-orange) hover:text-(--color-brand-orange) cursor-pointer transition-colors">
									<Plus size={22} />
									<span className="text-xs font-semibold">Добавить</span>
								</label>
							)}
						</div>
					</SortableContext>
				</DndContext>
			)}

			{uploadDisabled && items.length > 0 && !disabled && (
				<p className="text-xs text-(--color-text-secondary) px-1">
					Лимит {ANIMAL_GALLERY_MAX} фото достигнут. Удалите одно из существующих, чтобы добавить новое.
				</p>
			)}

			{uploadingCount > 0 && (
				<p className="text-xs text-(--color-text-secondary) px-1">Загружается: {uploadingCount}…</p>
			)}

			<input
				id={inputId}
				type="file"
				multiple
				accept={ACCEPT}
				className="hidden"
				disabled={uploadDisabled}
				onChange={handleFileInputChange}
			/>

			{pendingRemoval && (
				<RemoveGalleryPhotoConfirm
					previewUrl={pendingRemoval.previewUrl}
					isPending={isSyncing}
					onConfirm={() => void confirmRemoval()}
					onCancel={() => setPendingRemoval(null)}
				/>
			)}
		</div>
	);
};
