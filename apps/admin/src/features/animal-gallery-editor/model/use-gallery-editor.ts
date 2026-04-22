import { ALLOW_IMAGE_EXT, ANIMAL_GALLERY_MAX } from '@pif/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getUploadUrl, uploadFileToS3 } from '../../../entities/animal/api/media.api';
import { useSetAnimalGalleryMutation } from '../../../entities/animal/model/hooks';
import { getErrorMessage } from '../../../shared/api';
import { getMediaUrl } from '../../../shared/lib';
import { GalleryItemDraft } from './types';

const buildLocalId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const resolveExt = (fileName: string): (typeof ALLOW_IMAGE_EXT)[number] | null => {
	const ext = fileName.split('.').pop()?.toLowerCase();
	if (!ext) return null;
	return ALLOW_IMAGE_EXT.includes(ext as (typeof ALLOW_IMAGE_EXT)[number])
		? (ext as (typeof ALLOW_IMAGE_EXT)[number])
		: null;
};

const hydrateFromKeys = (keys: string[]): GalleryItemDraft[] =>
	keys.map((key) => ({
		localId: key,
		storageKey: key,
		previewUrl: getMediaUrl(key),
		isUploading: false
	}));

interface UseGalleryEditorInput {
	animalId: string;
	galleryUrls: string[] | null;
	disabled?: boolean;
}

interface UseGalleryEditorResult {
	items: GalleryItemDraft[];
	storedCount: number;
	uploadingCount: number;
	canAddMore: boolean;
	isSyncing: boolean;
	addFiles: (files: File[] | FileList) => Promise<void>;
	removeItem: (localId: string) => Promise<void>;
	reorder: (nextItems: GalleryItemDraft[]) => Promise<void>;
	dismissFailed: (localId: string) => void;
}

export const useGalleryEditor = ({
	animalId,
	galleryUrls,
	disabled
}: UseGalleryEditorInput): UseGalleryEditorResult => {
	const mutation = useSetAnimalGalleryMutation();
	const [items, setItems] = useState<GalleryItemDraft[]>(() => hydrateFromKeys(galleryUrls ?? []));

	const blobUrlsRef = useRef<Set<string>>(new Set());
	const itemsRef = useRef<GalleryItemDraft[]>(items);
	itemsRef.current = items;

	useEffect(() => {
		const serverKeys = galleryUrls ?? [];
		const current = itemsRef.current;
		if (current.some((item) => item.isUploading || item.failedFileName)) {
			return;
		}
		const stableKeys = current.filter((item) => item.storageKey).map((item) => item.storageKey);
		if (stableKeys.length === serverKeys.length && stableKeys.every((key, idx) => key === serverKeys[idx])) {
			return;
		}
		setItems(hydrateFromKeys(serverKeys));
	}, [galleryUrls]);

	useEffect(() => {
		const urls = blobUrlsRef.current;
		return () => {
			urls.forEach((url) => URL.revokeObjectURL(url));
			urls.clear();
		};
	}, []);

	const saveToBackend = useCallback(
		async (nextItems: GalleryItemDraft[]): Promise<boolean> => {
			const galleryKeys = nextItems
				.filter((item) => !item.isUploading && !item.failedFileName && item.storageKey)
				.map((item) => item.storageKey);
			try {
				await mutation.mutateAsync({ id: animalId, payload: { galleryKeys } });
				return true;
			} catch (error) {
				const message = await getErrorMessage(error);
				toast.error(`Не удалось сохранить галерею: ${message}`);
				return false;
			}
		},
		[animalId, mutation]
	);

	const addFiles = useCallback(
		async (filesInput: File[] | FileList): Promise<void> => {
			if (disabled) return;
			const files = Array.from(filesInput);
			if (files.length === 0) return;

			const current = itemsRef.current;
			const storedCount = current.filter((item) => !item.failedFileName).length;
			const remainingSlots = ANIMAL_GALLERY_MAX - storedCount;
			if (remainingSlots <= 0) {
				toast.error(`Достигнут лимит: ${ANIMAL_GALLERY_MAX} фото в галерее`);
				return;
			}

			const queued: { draft: GalleryItemDraft; file: File; ext: (typeof ALLOW_IMAGE_EXT)[number] }[] = [];
			let skippedByLimit = 0;

			for (const file of files) {
				if (queued.length >= remainingSlots) {
					skippedByLimit += 1;
					continue;
				}
				const ext = resolveExt(file.name);
				if (!ext) {
					toast.error(`Неподдерживаемый формат: ${file.name}`);
					continue;
				}

				const previewUrl = URL.createObjectURL(file);
				blobUrlsRef.current.add(previewUrl);
				queued.push({
					draft: {
						localId: buildLocalId(),
						storageKey: '',
						previewUrl,
						isUploading: true
					},
					file,
					ext
				});
			}

			if (skippedByLimit > 0) {
				toast.error(`Пропущено ${skippedByLimit} файлов: превышен лимит ${ANIMAL_GALLERY_MAX} фото`);
			}

			if (queued.length === 0) return;

			const drafts = queued.map(({ draft }) => draft);
			setItems((prev) => [...prev, ...drafts]);

			const uploadResults = await Promise.all(
				queued.map(async ({ draft, file, ext }) => {
					try {
						const uploadData = await getUploadUrl({ ext, type: 'image', space: 'animals' });
						await uploadFileToS3(uploadData, file);
						return { draft, file, key: uploadData.data.key };
					} catch (error) {
						const message = await getErrorMessage(error);
						toast.error(`Не удалось загрузить ${file.name}: ${message}`);
						return { draft, file, key: null };
					}
				})
			);

			const successful = new Map<string, string>();
			const failed = new Map<string, string>();
			for (const { draft, file, key } of uploadResults) {
				if (key) {
					successful.set(draft.localId, key);
				} else {
					failed.set(draft.localId, file.name);
				}
			}

			const afterUpload = itemsRef.current.map((item) => {
				const newKey = successful.get(item.localId);
				if (newKey) {
					return { ...item, storageKey: newKey, isUploading: false };
				}
				const failedName = failed.get(item.localId);
				if (failedName) {
					return { ...item, isUploading: false, failedFileName: failedName };
				}
				return item;
			});
			setItems(afterUpload);

			if (successful.size === 0) return;

			const saved = await saveToBackend(afterUpload);
			if (!saved) {
				setItems((prev) => prev.filter((item) => !successful.has(item.localId)));
				queued.forEach(({ draft }) => {
					if (draft.previewUrl.startsWith('blob:')) {
						URL.revokeObjectURL(draft.previewUrl);
						blobUrlsRef.current.delete(draft.previewUrl);
					}
				});
			}
		},
		[disabled, saveToBackend]
	);

	const removeItem = useCallback(
		async (localId: string): Promise<void> => {
			if (disabled) return;
			const current = itemsRef.current;
			const target = current.find((item) => item.localId === localId);
			if (!target) return;

			if (target.failedFileName || !target.storageKey) {
				setItems(current.filter((item) => item.localId !== localId));
				if (target.previewUrl.startsWith('blob:')) {
					URL.revokeObjectURL(target.previewUrl);
					blobUrlsRef.current.delete(target.previewUrl);
				}
				return;
			}

			const nextItems = current.filter((item) => item.localId !== localId);
			setItems(nextItems);

			const saved = await saveToBackend(nextItems);
			if (!saved) {
				setItems(current);
			} else if (target.previewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(target.previewUrl);
				blobUrlsRef.current.delete(target.previewUrl);
			}
		},
		[disabled, saveToBackend]
	);

	const reorder = useCallback(
		async (nextItems: GalleryItemDraft[]): Promise<void> => {
			if (disabled) return;
			const current = itemsRef.current;
			const prevKeys = current
				.filter((item) => !item.isUploading && !item.failedFileName)
				.map((item) => item.storageKey);
			const newKeys = nextItems
				.filter((item) => !item.isUploading && !item.failedFileName)
				.map((item) => item.storageKey);
			if (prevKeys.length === newKeys.length && prevKeys.every((key, idx) => key === newKeys[idx])) {
				return;
			}
			setItems(nextItems);
			const saved = await saveToBackend(nextItems);
			if (!saved) {
				setItems(current);
			}
		},
		[disabled, saveToBackend]
	);

	const dismissFailed = useCallback((localId: string): void => {
		setItems((prev) => {
			const target = prev.find((item) => item.localId === localId);
			if (target && target.previewUrl.startsWith('blob:')) {
				URL.revokeObjectURL(target.previewUrl);
				blobUrlsRef.current.delete(target.previewUrl);
			}
			return prev.filter((item) => item.localId !== localId);
		});
	}, []);

	const storedCount = useMemo(
		() => items.filter((item) => !item.failedFileName && !item.isUploading && item.storageKey).length,
		[items]
	);
	const uploadingCount = useMemo(() => items.filter((item) => item.isUploading).length, [items]);
	const canAddMore = storedCount + uploadingCount < ANIMAL_GALLERY_MAX;

	return {
		items,
		storedCount,
		uploadingCount,
		canAddMore,
		isSyncing: mutation.isPending,
		addFiles,
		removeItem,
		reorder,
		dismissFailed
	};
};
