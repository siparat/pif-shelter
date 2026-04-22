import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertTriangle, GripVertical, ImageOff, Loader2, Trash2 } from 'lucide-react';
import { JSX, useState } from 'react';
import { cn } from '../../../shared/lib';
import { GalleryItemDraft } from '../model/types';

interface Props {
	item: GalleryItemDraft;
	index: number;
	disabled?: boolean;
	onRequestRemove: (localId: string) => void;
}

export const SortableGalleryItem = ({ item, index, disabled, onRequestRemove }: Props): JSX.Element => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: item.localId,
		disabled: disabled || item.isUploading || Boolean(item.failedFileName)
	});

	const [isBroken, setIsBroken] = useState(false);

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 30 : undefined
	};

	const hasFailed = Boolean(item.failedFileName);
	const showImage = !isBroken && !hasFailed;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'group relative flex flex-col aspect-square w-full rounded-xl overflow-hidden border border-(--color-border) bg-(--color-bg-primary)',
				isDragging && 'ring-2 ring-(--color-brand-orange) shadow-lg',
				(item.isUploading || hasFailed) && 'opacity-80'
			)}>
			{showImage ? (
				<img
					src={item.previewUrl}
					alt={`Фото ${index + 1}`}
					loading="lazy"
					className="absolute inset-0 w-full h-full object-cover"
					onError={() => setIsBroken(true)}
				/>
			) : hasFailed ? (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-(--color-bg-primary) p-2 text-center">
					<AlertTriangle className="text-red-400" size={22} />
					<span className="text-xs text-(--color-text-secondary) line-clamp-2">
						{item.failedFileName ?? 'Файл не загрузился'}
					</span>
				</div>
			) : (
				<div className="absolute inset-0 flex items-center justify-center text-(--color-text-secondary)">
					<ImageOff size={28} />
				</div>
			)}

			{item.isUploading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/40">
					<Loader2 className="animate-spin text-white" size={24} />
				</div>
			)}

			{!disabled && !item.isUploading && !hasFailed && (
				<button
					type="button"
					aria-label="Переместить"
					{...attributes}
					{...listeners}
					className="absolute top-1 left-1 rounded-md bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none">
					<GripVertical size={14} />
				</button>
			)}

			{!disabled && !item.isUploading && (
				<button
					type="button"
					onClick={() => onRequestRemove(item.localId)}
					aria-label={hasFailed ? 'Убрать неудачную загрузку' : 'Удалить фото'}
					className="absolute top-1 right-1 rounded-md bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity">
					<Trash2 size={14} />
				</button>
			)}

			<span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
				{index + 1}
			</span>
		</div>
	);
};
