import { zodResolver } from '@hookform/resolvers/zod';
import { MaxPostMediaItems, PostVisibilityEnum } from '@pif/shared';
import { JSX, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CreatePostPayload } from '../../../../entities/post';
import { Button, Input, Select } from '../../../../shared/ui';
import { sanitizeEditorHtml } from '../../lib/sanitize';
import { toFormMedia, toMediaDraft } from '../../model/media-mapper';
import {
	buildEmptyPostEditorValues,
	EditorMediaDraft,
	PostEditorFormFieldValues,
	postEditorFormSchema,
	PostEditorInitialMediaDraft,
	PostEditorValues
} from '../../model/types';
import { PostMediaGallery } from '../PostMediaGallery/PostMediaGallery';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';

interface Props {
	animalId: string;
	defaultValues?: Partial<PostEditorValues>;
	initialMedia?: PostEditorInitialMediaDraft[];
	onSubmit: (payload: CreatePostPayload) => Promise<void> | void;
	onCancel?: () => void;
	submitLabel?: string;
	cancelLabel?: string;
	isSubmitting?: boolean;
	hideVisibility?: boolean;
}

const VISIBILITY_OPTIONS = [
	{ value: PostVisibilityEnum.PUBLIC, label: 'Публичный' },
	{ value: PostVisibilityEnum.PRIVATE, label: 'Приватный (только опекуны и сотрудники)' }
];

export const PostEditor = ({
	animalId,
	defaultValues,
	initialMedia,
	onSubmit,
	onCancel,
	submitLabel = 'Опубликовать',
	cancelLabel = 'Отмена',
	isSubmitting,
	hideVisibility = false
}: Props): JSX.Element => {
	const initialDrafts = useMemo<EditorMediaDraft[]>(
		() => (initialMedia ?? []).map((item, index) => toMediaDraft(item, index)),
		[initialMedia]
	);

	const [mediaDrafts, setMediaDrafts] = useState<EditorMediaDraft[]>(initialDrafts);
	const [isUploadingMedia, setIsUploadingMedia] = useState(false);

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors, isSubmitting: isFormSubmitting }
	} = useForm<PostEditorFormFieldValues, undefined, PostEditorValues>({
		resolver: zodResolver(postEditorFormSchema),
		defaultValues: {
			...buildEmptyPostEditorValues(),
			...defaultValues,
			media: toFormMedia(initialDrafts)
		}
	});

	const handleMediaChange = (next: EditorMediaDraft[]): void => {
		setMediaDrafts(next);
		setValue('media', toFormMedia(next), { shouldDirty: true, shouldValidate: true });
	};

	const isBusy = Boolean(isSubmitting) || isFormSubmitting || isUploadingMedia;

	const submit = handleSubmit(async (values) => {
		const sanitizedBody = sanitizeEditorHtml(values.body);
		const payload: CreatePostPayload = {
			animalId,
			title: values.title.trim(),
			body: sanitizedBody,
			visibility: values.visibility,
			media: values.media.map((item, index) => ({
				storageKey: item.storageKey,
				type: item.type,
				order: index
			}))
		};
		await onSubmit(payload);
	});

	return (
		<form
			onSubmit={submit}
			noValidate
			className="min-w-0 space-y-6 rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6">
			<Input
				{...register('title')}
				label="Заголовок"
				placeholder="Например: Первая встреча с новым другом"
				error={errors.title?.message}
				maxLength={200}
				disabled={isBusy}
			/>

			<Controller
				name="body"
				control={control}
				render={({ field }) => (
					<RichTextEditor
						label="Текст поста"
						value={field.value ?? ''}
						onChange={field.onChange}
						placeholder="Расскажите новости об этом животном..."
						error={errors.body?.message}
						disabled={isBusy}
					/>
				)}
			/>

			{!hideVisibility && (
				<Controller
					name="visibility"
					control={control}
					render={({ field }) => (
						<Select
							label="Видимость"
							options={VISIBILITY_OPTIONS}
							value={field.value}
							onChange={(event) => field.onChange(event.target.value)}
							error={errors.visibility?.message}
							disabled={isBusy}
						/>
					)}
				/>
			)}
			<PostMediaGallery
				label={`Медиа (до ${MaxPostMediaItems.ALL} файлов, не более ${MaxPostMediaItems.VIDEO} видео)`}
				items={mediaDrafts}
				onChange={handleMediaChange}
				onUploadingChange={setIsUploadingMedia}
				error={errors.media?.message}
				disabled={isBusy}
			/>

			<div className="flex flex-col md:flex-row justify-end gap-3">
				{onCancel && (
					<Button
						type="button"
						appearance="ghost"
						className="mt-0 md:w-auto px-6 py-2"
						onClick={onCancel}
						disabled={isBusy}>
						{cancelLabel}
					</Button>
				)}
				<Button type="submit" className="mt-0 md:w-auto px-6 py-2" isLoading={isBusy}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
};
