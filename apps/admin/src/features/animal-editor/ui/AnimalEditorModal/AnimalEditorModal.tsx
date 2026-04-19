import { zodResolver } from '@hookform/resolvers/zod';
import { createAnimalRequestSchema, updateAnimalRequestSchema } from '@pif/contracts';
import {
	ALLOW_IMAGE_EXT,
	AnimalCoatEnum,
	AnimalGenderEnum,
	AnimalSizeEnum,
	AnimalSpeciesEnum,
	AnimalStatusEnum,
	AnimalStatusNames
} from '@pif/shared';
import { JSX, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
	AnimalAvatar,
	AnimalItem,
	useAssignAnimalLabelMutation,
	useChangeAnimalStatusMutation,
	useCreateAnimalMutation,
	useSetAnimalCuratorMutation,
	useSetCostOfGuardianshipMutation,
	useUnassignAnimalLabelMutation,
	useUpdateAnimalMutation
} from '../../../../entities/animal';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import { VolunteerOption } from '../../../../entities/volunteer';
import { getErrorMessage } from '../../../../shared/api';
import { Button, Checkbox, Modal, Select } from '../../../../shared/ui';
import { animalEditorSchema, AnimalEditorValues, UpdateAnimalValues } from '../../model/types';
import { AnimalMainPropsBlock } from './AnimalMainPropsBlock';

interface Props {
	mode: 'create' | 'edit';
	animal: AnimalItem | null;
	labels: Array<{ id: string; name: string; color: string }>;
	volunteers: VolunteerOption[];
	onClose: () => void;
}

const STATUS_OPTIONS = Object.values(AnimalStatusEnum).map((value) => ({
	value,
	label: AnimalStatusNames[value]
}));

const toNullableNumber = (value: string): number | null => {
	if (!value.trim()) {
		return null;
	}
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

export const AnimalEditorModal = ({ mode, animal, labels, volunteers, onClose }: Props): JSX.Element => {
	const createMutation = useCreateAnimalMutation();
	const updateMutation = useUpdateAnimalMutation();
	const statusMutation = useChangeAnimalStatusMutation();
	const curatorMutation = useSetAnimalCuratorMutation();
	const costMutation = useSetCostOfGuardianshipMutation();
	const assignLabelMutation = useAssignAnimalLabelMutation();
	const unassignLabelMutation = useUnassignAnimalLabelMutation();

	const [isUploading, setIsUploading] = useState(false);
	const [uploadedAvatar, setUploadedAvatar] = useState<string>();

	const defaultValues = useMemo<AnimalEditorValues>(() => {
		if (mode === 'create' || !animal) {
			return {
				name: '',
				species: AnimalSpeciesEnum.DOG,
				gender: AnimalGenderEnum.MALE,
				birthDate: '',
				size: AnimalSizeEnum.MEDIUM,
				coat: AnimalCoatEnum.SHORT,
				color: '',
				description: '',
				isSterilized: false,
				isVaccinated: false,
				isParasiteTreated: false,
				avatarKey: '',
				labelIds: []
			};
		}

		return {
			name: animal.name,
			species: animal.species,
			gender: animal.gender,
			birthDate: animal.birthDate,
			size: animal.size,
			coat: animal.coat,
			color: animal.color,
			description: animal.description ?? '',
			isSterilized: animal.isSterilized,
			isVaccinated: animal.isVaccinated,
			isParasiteTreated: animal.isParasiteTreated,
			avatarKey: '',
			status: animal.status,
			curatorId: animal.curatorId ?? null,
			costOfGuardianship: animal.costOfGuardianship ? Number(animal.costOfGuardianship) : null,
			labelIds: animal.labels?.map((label) => label.id) ?? []
		};
	}, [animal, mode]);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { isSubmitting }
	} = useForm<AnimalEditorValues>({
		resolver: zodResolver(animalEditorSchema),
		defaultValues
	});

	const selectedLabelIds = watch('labelIds') ?? [];
	const selectedStatus = watch('status');
	const selectedCuratorId = watch('curatorId');
	const selectedCost = watch('costOfGuardianship');
	const avatarKey = watch('avatarKey');

	const isBusy =
		isSubmitting ||
		isUploading ||
		createMutation.isPending ||
		updateMutation.isPending ||
		statusMutation.isPending ||
		curatorMutation.isPending ||
		costMutation.isPending;

	const uploadAvatar = async (file: File): Promise<void> => {
		try {
			setIsUploading(true);
			const extension = file.name.split('.').pop()?.toLowerCase();
			if (!extension || !ALLOW_IMAGE_EXT.includes(extension as (typeof ALLOW_IMAGE_EXT)[number])) {
				toast.error('Разрешены только изображения: png, jpeg, jpg, webp, avif.');
				return;
			}

			const uploadData = await getUploadUrl({
				ext: extension as (typeof ALLOW_IMAGE_EXT)[number],
				type: 'image',
				space: 'animals'
			});
			await uploadFileToS3(uploadData, file);
			setValue('avatarKey', uploadData.data.key, { shouldDirty: true });

			const blob = new Blob([file]);
			setUploadedAvatar(URL.createObjectURL(blob));
			toast.success('Аватар загружен');
		} catch (error) {
			const message = await getErrorMessage(error);
			console.error(error);
			toast.error(message);
		} finally {
			setIsUploading(false);
		}
	};

	const onSubmit = async (values: AnimalEditorValues): Promise<void> => {
		try {
			if (mode === 'create') {
				const payload = createAnimalRequestSchema.parse({
					...values,
					costOfGuardianship: undefined,
					status: undefined,
					curatorId: undefined,
					labelIds: undefined
				});
				await createMutation.mutateAsync(payload);
				toast.success('Животное создано');
				onClose();
				return;
			}

			if (!animal) {
				return;
			}

			const updatePayload = updateAnimalRequestSchema.parse({
				name: values.name,
				species: values.species,
				gender: values.gender,
				birthDate: values.birthDate,
				size: values.size,
				coat: values.coat,
				color: values.color,
				description: values.description,
				isSterilized: values.isSterilized,
				isVaccinated: values.isVaccinated,
				isParasiteTreated: values.isParasiteTreated,
				avatarKey: values.avatarKey || undefined
			} as UpdateAnimalValues);

			await updateMutation.mutateAsync({ id: animal.id, payload: updatePayload });

			if (selectedStatus && selectedStatus !== animal.status) {
				await statusMutation.mutateAsync({
					id: animal.id,
					payload: { status: selectedStatus as AnimalItem['status'] }
				});
			}

			if ((selectedCuratorId ?? null) !== (animal.curatorId ?? null)) {
				await curatorMutation.mutateAsync({
					id: animal.id,
					payload: { curatorId: selectedCuratorId ?? null }
				});
			}

			const normalizedCost = selectedCost === undefined ? null : toNullableNumber(String(selectedCost));
			const initialCost = animal.costOfGuardianship ? Number(animal.costOfGuardianship) : null;
			if (normalizedCost !== initialCost) {
				await costMutation.mutateAsync({
					id: animal.id,
					payload: { costOfGuardianship: normalizedCost }
				});
			}

			const initialLabelIds = new Set(animal.labels?.map((label) => label.id) ?? []);
			const nextLabelIds = new Set(selectedLabelIds);

			const labelsToAssign = [...nextLabelIds].filter((id) => !initialLabelIds.has(id));
			const labelsToUnassign = [...initialLabelIds].filter((id) => !nextLabelIds.has(id));

			await Promise.all([
				...labelsToAssign.map((labelId) =>
					assignLabelMutation.mutateAsync({ id: animal.id, payload: { labelId } })
				),
				...labelsToUnassign.map((labelId) =>
					unassignLabelMutation.mutateAsync({ animalId: animal.id, labelId })
				)
			]);

			toast.success('Изменения сохранены');
			onClose();
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	return (
		<Modal
			title={mode === 'create' ? 'Создать животное' : `Редактирование: ${animal?.name ?? 'Животное'}`}
			onClose={onClose}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<AnimalMainPropsBlock register={register} gender={animal?.gender} />

				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<Checkbox {...register('isSterilized')} label="Стерилизован" />
					<Checkbox {...register('isVaccinated')} label="Вакцинирован" />
					<Checkbox {...register('isParasiteTreated')} label="Обработан от паразитов" />
				</div>

				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-primary) p-4">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
						<div className="flex items-center gap-3">
							{uploadedAvatar && (
								<AnimalAvatar
									width={52}
									height={52}
									fullUrl
									animal={{
										avatarUrl: uploadedAvatar,
										name: animal?.name ?? '',
										species: animal?.species ?? AnimalSpeciesEnum.DOG
									}}
								/>
							)}
							<div>
								<p className="font-semibold">Аватар</p>
								<p className="text-sm text-(--color-text-secondary)">
									{avatarKey ? `Ключ: ${avatarKey}` : 'Файл еще не загружен'}
								</p>
							</div>
						</div>
						<label className="inline-flex">
							<input
								type="file"
								accept="image/png,image/jpeg,image/webp"
								className="hidden"
								onChange={(event) => {
									const file = event.target.files?.[0];
									if (file) {
										void uploadAvatar(file);
									}
								}}
							/>
							<span className="cursor-pointer rounded-xl border border-(--color-border) bg-(--color-bg-secondary) px-4 py-2 text-sm font-semibold hover:bg-(--color-bg-primary)">
								{isUploading ? 'Загрузка...' : 'Загрузить фото'}
							</span>
						</label>
					</div>
				</div>
				{mode === 'edit' && animal && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Select
							label="Статус"
							value={selectedStatus ?? animal.status}
							onChange={(event) => setValue('status', event.target.value)}
							options={STATUS_OPTIONS}
						/>
						<Select
							label="Куратор"
							value={selectedCuratorId ?? ''}
							onChange={(event) => setValue('curatorId', event.target.value || null)}
							placeholder="Без куратора"
							options={volunteers.map((volunteer) => ({
								value: volunteer.id,
								label: `${volunteer.name} (${volunteer.position})`
							}))}
						/>
						<div>
							<label className="text-sm font-semibold px-1 mb-2 block">Стоимость опекунства</label>
							<input
								type="number"
								step={1}
								min={0}
								value={selectedCost ?? ''}
								onChange={(event) =>
									setValue(
										'costOfGuardianship',
										event.target.value ? Number(event.target.value) : null
									)
								}
								className="w-full rounded-xl border border-(--color-border) bg-(--color-bg-primary) py-2.5 px-3 text-sm"
							/>
							<p className="mt-2 text-xs text-(--color-text-secondary)">
								Пустое значение отключит стоимость опекунства.
							</p>
						</div>
						<div className="md:col-span-2 rounded-2xl border border-(--color-border) bg-(--color-bg-primary) p-4">
							<p className="font-semibold mb-3">Ярлыки</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{labels.map((label) => (
									<label
										key={label.id}
										className="flex items-center gap-2 rounded-xl border border-(--color-border) p-2 text-sm">
										<input
											type="checkbox"
											checked={selectedLabelIds.includes(label.id)}
											onChange={(event) => {
												const current = new Set(selectedLabelIds);
												if (event.target.checked) {
													current.add(label.id);
												} else {
													current.delete(label.id);
												}
												setValue('labelIds', [...current]);
											}}
											className="h-4 w-4 accent-(--color-brand-orange)"
										/>
										<span
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: label.color }}
										/>
										<span>{label.name}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				)}
				<div className="flex flex-col md:flex-row justify-end gap-3">
					<Button type="button" appearance="ghost" className="mt-0 md:w-auto px-6 py-2" onClick={onClose}>
						Отменить
					</Button>
					<Button type="submit" className="mt-0 md:w-auto px-6 py-2" isLoading={isBusy}>
						Сохранить
					</Button>
				</div>
			</form>
		</Modal>
	);
};
