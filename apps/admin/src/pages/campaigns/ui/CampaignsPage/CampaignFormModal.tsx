import { ALLOW_IMAGE_EXT } from '@pif/shared';
import { ImageIcon, Loader2, Save, Upload, X } from 'lucide-react';
import { ChangeEvent, JSX, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import { CampaignItem, useCreateCampaignMutation, useUpdateCampaignMutation } from '../../../../entities/campaign';
import { getErrorMessage } from '../../../../shared/api';
import { getMediaUrl } from '../../../../shared/lib';
import { Button, Input, Modal, Textarea } from '../../../../shared/ui';
import { AnimalPicker } from './AnimalPicker';
import {
	buildGoal,
	DESCRIPTION_MIN_LENGTH,
	resolvePublicMediaUrl,
	splitGoal,
	TITLE_MAX_LENGTH,
	toDateTimeLocal,
	toIso
} from './utils';

interface CampaignDraft {
	title: string;
	description: string;
	goal: number;
	endsAt: string;
	animalId?: string;
	previewImageKey?: string;
	previewImageUrl?: string;
}

interface Props {
	mode: 'create' | 'edit';
	campaign?: CampaignItem;
	onClose: () => void;
}

const buildInitialDraft = (campaign?: CampaignItem): CampaignDraft => {
	if (!campaign) {
		return {
			title: '',
			description: '',
			goal: 0,
			endsAt: '',
			animalId: undefined,
			previewImageKey: undefined,
			previewImageUrl: undefined
		};
	}
	return {
		title: campaign.title,
		description: campaign.description ?? '',
		goal: campaign.targetAmount ?? 0,
		endsAt: toDateTimeLocal(campaign.endsAt),
		animalId: campaign.animal?.id,
		previewImageKey: undefined,
		previewImageUrl: campaign.coverImageUrl ?? undefined
	};
};

export const CampaignFormModal = ({ mode, campaign, onClose }: Props): JSX.Element => {
	const [draft, setDraft] = useState<CampaignDraft>(() => buildInitialDraft(campaign));
	const [selectedAnimal, setSelectedAnimal] = useState(campaign?.animal ?? null);
	const [isUploading, setIsUploading] = useState(false);

	const createMutation = useCreateCampaignMutation();
	const updateMutation = useUpdateCampaignMutation();
	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const goalParts = splitGoal(draft.goal);

	const uploadPreview = async (file: File): Promise<{ key: string; url: string } | null> => {
		const extension = file.name.split('.').pop()?.toLowerCase();
		if (!extension || !ALLOW_IMAGE_EXT.includes(extension as (typeof ALLOW_IMAGE_EXT)[number])) {
			toast.error('Разрешены только изображения: png, jpeg, jpg, webp, avif.');
			return null;
		}
		const uploadData = await getUploadUrl({
			ext: extension as (typeof ALLOW_IMAGE_EXT)[number],
			type: 'image',
			space: 'campaigns'
		});
		await uploadFileToS3(uploadData, file);
		return { key: uploadData.data.key, url: getMediaUrl(uploadData.data.key) };
	};

	const onPreviewChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}
		event.target.value = '';
		try {
			setIsUploading(true);
			const uploaded = await uploadPreview(file);
			if (!uploaded) {
				return;
			}
			setDraft((prev) => ({
				...prev,
				previewImageKey: uploaded.key,
				previewImageUrl: uploaded.url
			}));
			toast.success('Превью загружено');
		} catch (error) {
			toast.error(await getErrorMessage(error));
		} finally {
			setIsUploading(false);
		}
	};

	const removePreview = (): void => {
		setDraft((prev) => ({ ...prev, previewImageKey: undefined, previewImageUrl: undefined }));
	};

	const validate = (): boolean => {
		if (!draft.title.trim()) {
			toast.error('Укажите заголовок');
			return false;
		}
		if (draft.title.trim().length > TITLE_MAX_LENGTH) {
			toast.error(`Заголовок должен быть не длиннее ${TITLE_MAX_LENGTH} символов`);
			return false;
		}
		if (!draft.description.trim() || draft.description.trim().length < DESCRIPTION_MIN_LENGTH) {
			toast.error(`Описание должно быть не короче ${DESCRIPTION_MIN_LENGTH} символов`);
			return false;
		}
		if (!draft.endsAt) {
			toast.error('Укажите дату окончания сбора');
			return false;
		}
		if (draft.goal < 0) {
			toast.error('Цель сбора не может быть отрицательной');
			return false;
		}
		return true;
	};

	const onSubmit = async (): Promise<void> => {
		if (!validate()) {
			return;
		}
		const payload = {
			title: draft.title.trim(),
			description: draft.description.trim(),
			goal: Number(draft.goal),
			endsAt: toIso(draft.endsAt),
			animalId: draft.animalId || undefined,
			previewImage: draft.previewImageKey || undefined
		};

		try {
			if (mode === 'create') {
				await createMutation.mutateAsync(payload);
				toast.success('Сбор создан');
			} else if (campaign) {
				await updateMutation.mutateAsync({ id: campaign.id, payload });
				toast.success('Сбор обновлён');
			}
			onClose();
		} catch (error) {
			toast.error(await getErrorMessage(error));
		}
	};

	const descriptionLength = draft.description.trim().length;
	const descriptionHint = `${descriptionLength} / минимум ${DESCRIPTION_MIN_LENGTH}`;

	return (
		<Modal title={mode === 'create' ? 'Новый сбор' : 'Редактирование сбора'} onClose={onClose}>
			<div className="space-y-5">
				<div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5">
					<div className="space-y-3">
						<span className="text-sm font-semibold text-(--color-text-primary) px-1">Превью</span>
						<div className="relative w-full aspect-square rounded-2xl border border-dashed border-(--color-border) bg-(--color-bg-primary) overflow-hidden flex items-center justify-center">
							{draft.previewImageUrl ? (
								<>
									<img
										src={resolvePublicMediaUrl(draft.previewImageUrl) ?? ''}
										alt="Превью сбора"
										className="w-full h-full object-cover"
									/>
									<button
										type="button"
										onClick={removePreview}
										className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70"
										aria-label="Удалить превью">
										<X size={14} />
									</button>
								</>
							) : (
								<div className="flex flex-col items-center gap-2 text-(--color-text-secondary)">
									<ImageIcon size={32} />
									<span className="text-xs">Нет изображения</span>
								</div>
							)}
						</div>
						<label className="flex">
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(event) => void onPreviewChange(event)}
								disabled={isUploading}
							/>
							<span className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl border border-(--color-border) bg-(--color-bg-secondary) px-4 py-2 text-sm font-semibold hover:bg-(--color-bg-primary)">
								{isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
								{isUploading ? 'Загрузка...' : 'Загрузить превью'}
							</span>
						</label>
					</div>

					<div className="space-y-4">
						<Input
							label={`Заголовок (${draft.title.length}/${TITLE_MAX_LENGTH})`}
							value={draft.title}
							maxLength={TITLE_MAX_LENGTH}
							onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<div className="flex flex-col gap-2">
								<span className="text-sm font-semibold text-(--color-text-primary) px-1">
									Цель сбора
								</span>
								<div className="grid grid-cols-2 rounded-xl overflow-hidden border border-(--color-border) focus-within:border-(--color-brand-orange)">
									<div className="relative">
										<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-(--color-text-secondary)">
											руб
										</span>
										<input
											type="number"
											min={0}
											value={String(goalParts.rubles)}
											onChange={(event) =>
												setDraft((prev) => ({
													...prev,
													goal: buildGoal(Number(event.target.value || 0), goalParts.kopecks)
												}))
											}
											className="w-full bg-(--color-bg-primary) py-2.5 pl-3 pr-10 text-sm border-r border-(--color-border) focus:outline-none"
										/>
									</div>
									<div className="relative">
										<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-(--color-text-secondary)">
											коп
										</span>
										<input
											type="number"
											min={0}
											max={99}
											value={String(goalParts.kopecks)}
											onChange={(event) =>
												setDraft((prev) => ({
													...prev,
													goal: buildGoal(goalParts.rubles, Number(event.target.value || 0))
												}))
											}
											className="w-full bg-(--color-bg-primary) py-2.5 pl-3 pr-10 text-sm focus:outline-none"
										/>
									</div>
								</div>
							</div>
							<Input
								label="Дата окончания"
								type="datetime-local"
								value={draft.endsAt}
								onChange={(event) => setDraft((prev) => ({ ...prev, endsAt: event.target.value }))}
							/>
						</div>

						<AnimalPicker
							label="Животное"
							value={draft.animalId}
							selectedAnimal={selectedAnimal}
							onChange={(animalId, animal) => {
								setDraft((prev) => ({ ...prev, animalId }));
								setSelectedAnimal(animal);
							}}
						/>
					</div>
				</div>

				<Textarea
					label={`Описание (${descriptionHint})`}
					rows={6}
					value={draft.description}
					onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
				/>

				<div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 border-t border-(--color-border)">
					<Button type="button" appearance="ghost" className="mt-0 px-5 py-2.5" onClick={onClose}>
						Отмена
					</Button>
					<Button
						type="button"
						className="mt-0 px-5 py-2.5"
						onClick={() => void onSubmit()}
						isLoading={isSubmitting}>
						<Save size={14} />
						{mode === 'create' ? 'Создать сбор' : 'Сохранить'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
