import { EditorMediaDraft, PostEditorInitialMediaDraft, PostEditorMediaItem } from './types';

export const toMediaDraft = (item: PostEditorInitialMediaDraft, order: number): EditorMediaDraft => ({
	localId: Math.random().toString(36).slice(2),
	storageKey: item.storageKey,
	type: item.type,
	order,
	previewUrl: item.previewUrl,
	isUploading: false
});

export const toFormMedia = (drafts: EditorMediaDraft[]): PostEditorMediaItem[] =>
	drafts
		.filter((draft) => !draft.isUploading && draft.storageKey)
		.map((draft, index) => ({ storageKey: draft.storageKey, type: draft.type, order: index }));
