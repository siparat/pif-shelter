import {
	closestCenter,
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors
} from '@dnd-kit/core';
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { ALLOW_IMAGE_EXT, ALLOW_VIDEO_EXT, MaxPostMediaItems, PostMediaTypeEnum } from '@pif/shared';
import { Plus } from 'lucide-react';
import { JSX, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import { getErrorMessage } from '../../../../shared/api';
import { cn } from '../../../../shared/lib';
import { resolveExt } from '../../lib/resolve-ext';
import { ACCEPT_ATTRIBUTE } from '../../model/constants';
import { EditorMediaDraft } from '../../model/types';
import { SortableMediaElement } from './SortableMediaElement';

interface Props {
	items: EditorMediaDraft[];
	onChange: (items: EditorMediaDraft[]) => void;
	onUploadingChange?: (isUploading: boolean) => void;
	disabled?: boolean;
	error?: string;
	label?: string;
}

export const PostMediaGallery = ({
	items,
	onChange,
	onUploadingChange,
	disabled,
	error,
	label
}: Props): JSX.Element => {
	const inputId = useId();
	const [isDndActive, setIsDndActive] = useState(false);
	const blobUrlsRef = useRef<Set<string>>(new Set());
	const itemsRef = useRef<EditorMediaDraft[]>(items);
	itemsRef.current = items;

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	const canAddMore = items.length < MaxPostMediaItems.ALL;

	const sortableIds = useMemo(() => items.map((item) => item.localId), [items]);
	const uploadingCount = useMemo(() => items.filter((item) => item.isUploading).length, [items]);
	const videoCount = useMemo(() => items.filter((item) => item.type === PostMediaTypeEnum.VIDEO).length, [items]);

	const applyItems = useCallback(
		(next: EditorMediaDraft[]): EditorMediaDraft[] => {
			const normalized = next.map((item, index) => ({ ...item, order: index }));
			itemsRef.current = normalized;
			onChange(normalized);
			return normalized;
		},
		[onChange]
	);

	const updateItem = useCallback(
		(localId: string, patch: Partial<EditorMediaDraft>) => {
			const current = itemsRef.current;
			if (!current.some((item) => item.localId === localId)) return;
			const next = current.map((item) => (item.localId === localId ? { ...item, ...patch } : item));
			applyItems(next);
		},
		[applyItems]
	);

	const removeItem = useCallback(
		(localId: string) => {
			const current = itemsRef.current;
			const target = current.find((item) => item.localId === localId);
			if (target && target.previewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(target.previewUrl);
			}
			applyItems(current.filter((item) => item.localId !== localId));
		},
		[applyItems]
	);

	const handleFiles = useCallback(
		async (fileList: FileList | File[]) => {
			const files = Array.from(fileList);
			if (!files.length) return;

			const currentItems = itemsRef.current;
			const remainingSlots = MaxPostMediaItems.ALL - currentItems.length;
			if (remainingSlots <= 0) {
				toast.error(`Достигнут лимит в ${MaxPostMediaItems.ALL} медиа`);
				return;
			}

			let currentHasVideo = currentItems.some((item) => item.type === PostMediaTypeEnum.VIDEO);
			let added = 0;
			const queuedDrafts: { draft: EditorMediaDraft; file: File; ext: string }[] = [];

			for (const file of files) {
				if (added >= remainingSlots) {
					toast.error(`Добавлено максимум ${MaxPostMediaItems.ALL} медиа. Лишние файлы пропущены.`);
					break;
				}
				const resolved = resolveExt(file);
				if (!resolved) {
					toast.error(`Неподдерживаемый формат файла: ${file.name}`);
					continue;
				}
				if (resolved.type === PostMediaTypeEnum.VIDEO) {
					if (currentHasVideo) {
						toast.error(`Можно прикрепить не более ${MaxPostMediaItems.VIDEO} видео`);
						continue;
					}
					currentHasVideo = true;
				}

				const localId = Math.random().toString(36).slice(2);
				const previewUrl = URL.createObjectURL(file);
				blobUrlsRef.current.add(previewUrl);
				const draft: EditorMediaDraft = {
					localId,
					storageKey: '',
					type: resolved.type,
					order: currentItems.length + added,
					previewUrl,
					isUploading: true
				};
				queuedDrafts.push({ draft, file, ext: resolved.ext });
				added += 1;
			}

			if (!queuedDrafts.length) return;

			applyItems([...currentItems, ...queuedDrafts.map(({ draft }) => draft)]);

			await Promise.all(
				queuedDrafts.map(async ({ draft, file, ext }) => {
					try {
						const uploadData = await getUploadUrl({
							ext: ext as (typeof ALLOW_IMAGE_EXT)[number] | (typeof ALLOW_VIDEO_EXT)[number],
							type: draft.type === PostMediaTypeEnum.IMAGE ? 'image' : 'video',
							space: 'posts'
						});
						await uploadFileToS3(uploadData, file);
						updateItem(draft.localId, {
							storageKey: uploadData.data.key,
							isUploading: false
						});
					} catch (uploadError) {
						const message = await getErrorMessage(uploadError);
						toast.error(`Не удалось загрузить ${file.name}: ${message}`);
						if (draft.previewUrl.startsWith('blob:')) {
							URL.revokeObjectURL(draft.previewUrl);
							blobUrlsRef.current.delete(draft.previewUrl);
						}
						applyItems(itemsRef.current.filter((candidate) => candidate.localId !== draft.localId));
					}
				})
			);
		},
		[applyItems, updateItem]
	);

	const handleFileInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (files?.length) void handleFiles(files);
			event.target.value = '';
		},
		[handleFiles]
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setIsDndActive(false);
			const { active, over } = event;
			console.log(active, over, items);
			if (!over || active.id === over.id) return;
			const oldIndex = items.findIndex((item) => item.localId === active.id);
			const newIndex = items.findIndex((item) => item.localId === over.id);
			if (oldIndex < 0 || newIndex < 0) return;
			applyItems(arrayMove(items, oldIndex, newIndex));
		},
		[applyItems, items]
	);

	useEffect(() => {
		onUploadingChange?.(uploadingCount > 0);
	}, [uploadingCount, onUploadingChange]);

	useEffect(() => {
		items.forEach((item) => {
			if (item.previewUrl.startsWith('blob:')) {
				blobUrlsRef.current.add(item.previewUrl);
			}
		});
	}, [items]);

	useEffect(() => {
		return () => {
			blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
			blobUrlsRef.current.clear();
		};
	}, []);

	return (
		<div className="flex flex-col gap-2">
			{label && <span className="text-sm font-semibold text-(--color-text-primary) px-1">{label}</span>}

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={() => setIsDndActive(true)}
				onDragCancel={() => setIsDndActive(false)}
				onDragEnd={handleDragEnd}>
				<SortableContext items={sortableIds} strategy={horizontalListSortingStrategy}>
					<div
						className={cn(
							'flex flex-wrap gap-3 rounded-xl border bg-(--color-bg-primary) p-3 transition-colors',
							error ? 'border-red-400' : 'border-(--color-border)',
							isDndActive && 'border-(--color-brand-orange)'
						)}>
						{items.map((item) => (
							<SortableMediaElement
								key={item.localId}
								item={item}
								onRemove={removeItem}
								disabled={disabled}
							/>
						))}

						<label
							htmlFor={inputId}
							aria-disabled={disabled || !canAddMore}
							className={cn(
								'flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-(--color-border) text-(--color-text-secondary) text-xs gap-2',
								canAddMore && !disabled
									? 'cursor-pointer hover:border-(--color-brand-orange) hover:text-(--color-brand-orange)'
									: 'opacity-50 cursor-not-allowed'
							)}>
							<Plus size={22} />
							<span className="text-center px-1 leading-tight">
								{canAddMore ? 'Добавить файл' : 'Достигнут лимит'}
							</span>
						</label>

						<input
							id={inputId}
							type="file"
							multiple
							accept={ACCEPT_ATTRIBUTE}
							className="hidden"
							disabled={disabled || !canAddMore}
							onChange={handleFileInputChange}
						/>
					</div>
				</SortableContext>
			</DndContext>

			<div className="flex items-center justify-between px-1 text-xs text-(--color-text-secondary)">
				<span>
					{items.length} / {MaxPostMediaItems.ALL} · видео: {`${videoCount} / ${MaxPostMediaItems.VIDEO}`}
				</span>
				{uploadingCount > 0 && <span>Загружается: {uploadingCount}</span>}
			</div>

			{error && <span className="text-xs text-red-400 px-1 font-medium">{error}</span>}
		</div>
	);
};
