import { JSX } from 'react';
import { EditorMediaDraft } from '../../model/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../../shared/lib';
import { PostMediaTypeEnum } from '@pif/shared';
import { VideoIcon, Loader2, GripVertical, Trash2 } from 'lucide-react';

interface Props {
	item: EditorMediaDraft;
	onRemove: (localId: string) => void;
	disabled?: boolean;
}

export const SortableMediaElement = ({ item, onRemove, disabled }: Props): JSX.Element => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: item.localId,
		disabled: disabled || item.isUploading
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 30 : undefined
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				'group relative flex flex-col w-32 h-32 rounded-xl overflow-hidden border border-(--color-border) bg-(--color-bg-primary)',
				isDragging && 'ring-2 ring-(--color-brand-orange) shadow-lg',
				item.isUploading && 'opacity-70'
			)}>
			{item.type === PostMediaTypeEnum.IMAGE ? (
				<img src={item.previewUrl} alt="Медиа" loading="lazy" className="object-cover w-full h-full" />
			) : (
				<div className="relative w-full h-full">
					<video
						src={item.previewUrl}
						muted
						preload="metadata"
						className="object-cover w-full h-full"
						playsInline
						autoPlay
						loop
					/>
					<span className="absolute top-1 left-1 rounded-md bg-black/60 p-1 text-white">
						<VideoIcon size={12} />
					</span>
				</div>
			)}

			{item.isUploading && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/40">
					<Loader2 className="animate-spin text-white" size={24} />
				</div>
			)}

			<button
				type="button"
				{...attributes}
				{...listeners}
				aria-label="Переместить"
				disabled={disabled || item.isUploading}
				className={cn(
					'absolute top-1 right-8 rounded-md bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity',
					'focus-visible:opacity-100 cursor-grab active:cursor-grabbing',
					(disabled || item.isUploading) && 'pointer-events-none'
				)}>
				<GripVertical size={12} />
			</button>

			<button
				type="button"
				onClick={() => onRemove(item.localId)}
				aria-label="Удалить медиа"
				disabled={disabled || item.isUploading}
				className={cn(
					'absolute top-1 right-1 rounded-md bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity',
					(disabled || item.isUploading) && 'pointer-events-none opacity-60'
				)}>
				<Trash2 size={12} />
			</button>
		</div>
	);
};
