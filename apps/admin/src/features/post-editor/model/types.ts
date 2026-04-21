import { createPostRequestSchema, postMediaItemSchema } from '@pif/contracts';
import { PostMediaTypeEnum, PostVisibilityEnum } from '@pif/shared';
import { z } from 'zod';

export const postEditorFormSchema = createPostRequestSchema.pick({
	title: true,
	body: true,
	visibility: true,
	media: true
});

export type PostEditorMediaItem = z.infer<typeof postMediaItemSchema>;
export type PostEditorValues = z.output<typeof postEditorFormSchema>;
export type PostEditorFormFieldValues = z.input<typeof postEditorFormSchema>;

export const buildEmptyPostEditorValues = (): PostEditorValues => ({
	title: '',
	body: '',
	visibility: PostVisibilityEnum.PUBLIC,
	media: []
});

export interface PostEditorInitialMediaDraft {
	storageKey: string;
	type: PostMediaTypeEnum;
	previewUrl: string;
}

export interface EditorMediaDraft extends PostEditorMediaItem {
	localId: string;
	previewUrl: string;
	isUploading: boolean;
}
