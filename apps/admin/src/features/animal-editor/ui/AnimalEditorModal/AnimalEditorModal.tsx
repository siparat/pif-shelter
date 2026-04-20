import { zodResolver } from '@hookform/resolvers/zod';
import { createAnimalRequestSchema, updateAnimalRequestSchema } from '@pif/contracts';
import {
	ALLOW_IMAGE_EXT,
	AnimalCoatEnum,
	AnimalGenderEnum,
	AnimalSizeEnum,
	AnimalSpeciesEnum,
	IMAGE_MIME_TYPES,
	UserRole
} from '@pif/shared';
import { Loader2 } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
	AnimalDetails,
	AnimalItem,
	useAnimalDetails,
	useAssignAnimalLabelMutation,
	useChangeAnimalStatusMutation,
	useCreateAnimalMutation,
	useDeleteAnimalMutation,
	useSetAnimalCuratorMutation,
	useSetCostOfGuardianshipMutation,
	useUnassignAnimalLabelMutation,
	useUpdateAnimalMutation
} from '../../../../entities/animal';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { getMediaUrl } from '../../../../shared/lib';
import { Button, Checkbox, ErrorState, Modal } from '../../../../shared/ui';
import { useUploader } from '../../../upload/model/hooks';
import { Uploader } from '../../../upload/ui/Uploader';
import { AnimalEditorValues, createAnimalEditorSchema, editAnimalEditorSchema } from '../../model/types';
import { AnimalEditPropsBlock } from './AnimalEditPropsBlock';
import { AnimalMainPropsBlock } from './AnimalMainPropsBlock';

interface Props {
	mode: 'create' | 'edit';
	animal: AnimalItem | null;
	onClose: () => void;
}

const buildEmptyAnimalEditorValues = (): AnimalEditorValues => ({
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
});

const buildEditAnimalEditorValues = (source: AnimalDetails): AnimalEditorValues => ({
	name: source.name,
	species: source.species,
	gender: source.gender,
	birthDate: source.birthDate,
	size: source.size,
	coat: source.coat,
	color: source.color,
	description: source.description ?? '',
	isSterilized: source.isSterilized,
	isVaccinated: source.isVaccinated,
	isParasiteTreated: source.isParasiteTreated,
	avatarKey: source.avatarUrl ?? '',
	status: source.status,
	curatorId: source.curatorId ?? null,
	costOfGuardianship: source.costOfGuardianship != null ? Number(source.costOfGuardianship) : null,
	labelIds: source.labels?.map((label) => label.id) ?? []
});

export const AnimalEditorModal = ({ mode, animal, onClose }: Props): JSX.Element => {
	const createMutation = useCreateAnimalMutation();
	const updateMutation = useUpdateAnimalMutation();
	const deleteMutation = useDeleteAnimalMutation();
	const statusMutation = useChangeAnimalStatusMutation();
	const curatorMutation = useSetAnimalCuratorMutation();
	const costMutation = useSetCostOfGuardianshipMutation();
	const assignLabelMutation = useAssignAnimalLabelMutation();
	const unassignLabelMutation = useUnassignAnimalLabelMutation();
	const { data: session } = useSession();
	const canDeleteAnimal = session?.user.role === UserRole.ADMIN || session?.user.role === UserRole.SENIOR_VOLUNTEER;

	const animalId = mode === 'edit' && animal ? animal.id : null;
	const {
		data: detailAnimal,
		isPending: isDetailPending,
		isError: isDetailError,
		error: detailError,
		refetch: refetchDetail
	} = useAnimalDetails(animalId);

	const defaultUploadedUrl = useMemo(
		() =>
			(detailAnimal?.avatarUrl ?? animal?.avatarUrl) &&
			getMediaUrl((detailAnimal?.avatarUrl ?? animal?.avatarUrl) as string),
		[detailAnimal?.avatarUrl, animal?.avatarUrl]
	);
	const {
		ref: uploaderRef,
		setUploadedUrl,
		setIsUploading,
		uploadedUrl,
		isUploading
	} = useUploader({
		defaultUploadedUrl
	});

	const lastHydratedDetailIdRef = useRef<string | null>(null);

	const resolverSchema = useMemo(
		() => (mode === 'create' ? createAnimalEditorSchema : editAnimalEditorSchema),
		[mode]
	);

	const {
		register,
		control,
		handleSubmit,
		watch,
		setValue,
		reset,
		clearErrors,
		formState: { isSubmitting, errors }
	} = useForm<AnimalEditorValues>({
		resolver: zodResolver(resolverSchema),
		defaultValues: buildEmptyAnimalEditorValues()
	});

	useEffect(() => {
		if (mode === 'create') {
			lastHydratedDetailIdRef.current = null;
			reset(buildEmptyAnimalEditorValues());
			setUploadedUrl(null);
			return;
		}
		if (!animal || !detailAnimal) {
			return;
		}
		if (lastHydratedDetailIdRef.current === detailAnimal.id) {
			return;
		}
		lastHydratedDetailIdRef.current = detailAnimal.id;
		reset(buildEditAnimalEditorValues(detailAnimal));
		setUploadedUrl(detailAnimal.avatarUrl ? getMediaUrl(detailAnimal.avatarUrl) : null);
	}, [animal, detailAnimal, mode, reset, setUploadedUrl]);

	const selectedLabelIds = watch('labelIds') ?? [];
	const selectedStatus = watch('status');
	const selectedCuratorId = watch('curatorId');
	const selectedCost = watch('costOfGuardianship');

	const isBusy =
		isSubmitting ||
		isUploading ||
		createMutation.isPending ||
		updateMutation.isPending ||
		deleteMutation.isPending ||
		statusMutation.isPending ||
		curatorMutation.isPending ||
		costMutation.isPending;

	const uploadAvatar = async (file: File): Promise<{ url: string } | void> => {
		try {
			clearErrors('avatarKey');
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

			toast.success('Аватар загружен');

			return { url: getMediaUrl(uploadData.data.key) };
		} catch (error) {
			const message = await getErrorMessage(error);
			console.error(error);
			toast.error(message);
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

			if (!animal || !detailAnimal) {
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
			});

			await updateMutation.mutateAsync({ id: detailAnimal.id, payload: updatePayload });

			if (selectedStatus && selectedStatus !== detailAnimal.status) {
				await statusMutation.mutateAsync({
					id: detailAnimal.id,
					payload: { status: selectedStatus as AnimalItem['status'] }
				});
			}

			if ((selectedCuratorId ?? null) !== (detailAnimal.curatorId ?? null)) {
				await curatorMutation.mutateAsync({
					id: detailAnimal.id,
					payload: { curatorId: selectedCuratorId ?? null }
				});
			}

			const normalizedCost = !selectedCost ? null : selectedCost;
			const initialCost =
				detailAnimal.costOfGuardianship != null ? Number(detailAnimal.costOfGuardianship) : null;
			if (normalizedCost !== initialCost) {
				await costMutation.mutateAsync({
					id: detailAnimal.id,
					payload: { costOfGuardianship: normalizedCost }
				});
			}

			const initialLabelIds = new Set(detailAnimal.labels?.map((label) => label.id) ?? []);
			const nextLabelIds = new Set(selectedLabelIds);

			const labelsToAssign = [...nextLabelIds].filter((id) => !initialLabelIds.has(id));
			const labelsToUnassign = [...initialLabelIds].filter((id) => !nextLabelIds.has(id));

			await Promise.all([
				...labelsToAssign.map((labelId) =>
					assignLabelMutation.mutateAsync({ id: detailAnimal.id, payload: { labelId } })
				),
				...labelsToUnassign.map((labelId) =>
					unassignLabelMutation.mutateAsync({ animalId: detailAnimal.id, labelId })
				)
			]);

			toast.success('Изменения сохранены');
			onClose();
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	const handleDelete = async (): Promise<void> => {
		if (mode !== 'edit' || !detailAnimal) {
			return;
		}
		const isConfirmed = window.confirm(`Удалить животное "${detailAnimal.name}"? Действие нельзя отменить.`);
		if (!isConfirmed) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(detailAnimal.id);
			toast.success('Животное удалено');
			onClose();
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	const showDetailLoader = mode === 'edit' && Boolean(animal) && !detailAnimal && isDetailPending;
	const showDetailError = mode === 'edit' && Boolean(animal) && !detailAnimal && isDetailError;
	const showForm = mode === 'create' || Boolean(detailAnimal);

	return (
		<Modal
			title={
				mode === 'create'
					? 'Создать животное'
					: `Редактирование: ${detailAnimal?.name ?? animal?.name ?? 'Животное'}`
			}
			onClose={onClose}>
			{showDetailLoader && (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
				</div>
			)}
			{showDetailError && (
				<ErrorState
					description={detailError?.message ?? 'Не удалось загрузить карточку животного.'}
					onRetry={() => void refetchDetail()}
				/>
			)}
			{showForm && (
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<AnimalMainPropsBlock
						control={control}
						errors={errors}
						register={register}
						gender={watch('gender')}
					/>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<Checkbox {...register('isSterilized')} label="Стерилизован" />
						<Checkbox {...register('isVaccinated')} label="Вакцинирован" />
						<Checkbox {...register('isParasiteTreated')} label="Обработан от паразитов" />
					</div>

					<Uploader
						{...register('avatarKey')}
						title="Аватар"
						error={errors.avatarKey?.message}
						accept={Object.values(IMAGE_MIME_TYPES).join(',')}
						onUpload={uploadAvatar}
						ref={uploaderRef}
						setIsUploading={setIsUploading}
						setUploadedUrl={setUploadedUrl}
						uploadedUrl={uploadedUrl}
						isUploading={isUploading}
					/>

					{mode === 'edit' && detailAnimal && (
						<AnimalEditPropsBlock
							setLabels={(labels) => setValue('labelIds', labels)}
							control={control}
							register={register}
							selectedLabelIds={selectedLabelIds}
							errors={errors}
						/>
					)}
					<div className="flex flex-col md:flex-row justify-end gap-3">
						{mode === 'edit' && canDeleteAnimal && (
							<Button
								type="button"
								appearance="red"
								className="mt-0 md:w-auto px-6 py-2 md:mr-auto"
								onClick={() => void handleDelete()}
								isLoading={deleteMutation.isPending}>
								Удалить
							</Button>
						)}
						<Button type="button" appearance="ghost" className="mt-0 md:w-auto px-6 py-2" onClick={onClose}>
							Отменить
						</Button>
						<Button type="submit" className="mt-0 md:w-auto px-6 py-2" isLoading={isBusy}>
							Сохранить
						</Button>
					</div>
				</form>
			)}
		</Modal>
	);
};
