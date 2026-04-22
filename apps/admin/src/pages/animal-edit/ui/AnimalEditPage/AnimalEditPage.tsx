import { zodResolver } from '@hookform/resolvers/zod';
import { updateAnimalRequestSchema } from '@pif/contracts';
import {
	ALLOW_IMAGE_EXT,
	AnimalCoatEnum,
	AnimalGenderEnum,
	AnimalSizeEnum,
	AnimalSpeciesEnum,
	AnimalStatusEnum,
	IMAGE_MIME_TYPES,
	UserRole
} from '@pif/shared';
import { Loader2 } from 'lucide-react';
import { JSX, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
	AnimalDetails,
	useAnimalDetails,
	useAssignAnimalLabelMutation,
	useCanEditAnimal,
	useChangeAnimalStatusMutation,
	useDeleteAnimalMutation,
	useSetAnimalCuratorMutation,
	useSetCostOfGuardianshipMutation,
	useUnassignAnimalLabelMutation,
	useUpdateAnimalMutation
} from '../../../../entities/animal';
import { getUploadUrl, uploadFileToS3 } from '../../../../entities/animal/api/media.api';
import { AnimalAvatar } from '../../../../entities/animal/ui/AnimalAvatar/AnimalAvatar';
import { AnimalStatusBadge } from '../../../../entities/animal/ui/AnimalStatusBadge/AnimalStatusBadge';
import { useSession } from '../../../../entities/session/model/hooks';
import { getErrorMessage } from '../../../../shared/api';
import { ROUTES } from '../../../../shared/config';
import { getMediaUrl } from '../../../../shared/lib';
import { Button, Checkbox, ErrorState, PageTitle } from '../../../../shared/ui';
import { AnimalEditorValues, editAnimalEditorSchema } from '../../../../features/animal-editor/model/types';
import { AnimalEditPropsBlock } from '../../../../features/animal-editor/ui/AnimalEditorModal/AnimalEditPropsBlock';
import { AnimalMainPropsBlock } from '../../../../features/animal-editor/ui/AnimalEditorModal/AnimalMainPropsBlock';
import { AnimalGalleryEditor } from '../../../../features/animal-gallery-editor';
import { useUploader } from '../../../../features/upload/model/hooks';
import { Uploader } from '../../../../features/upload/ui/Uploader';

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

export const AnimalEditPage = (): JSX.Element => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const { data: session } = useSession();

	const updateMutation = useUpdateAnimalMutation();
	const deleteMutation = useDeleteAnimalMutation();
	const statusMutation = useChangeAnimalStatusMutation();
	const curatorMutation = useSetAnimalCuratorMutation();
	const costMutation = useSetCostOfGuardianshipMutation();
	const assignLabelMutation = useAssignAnimalLabelMutation();
	const unassignLabelMutation = useUnassignAnimalLabelMutation();

	const {
		data: detailAnimal,
		isPending: isDetailPending,
		isError: isDetailError,
		error: detailError,
		refetch: refetchDetail
	} = useAnimalDetails(id ?? null);

	const defaultUploadedUrl = useMemo(
		() => (detailAnimal?.avatarUrl ? getMediaUrl(detailAnimal.avatarUrl) : null),
		[detailAnimal?.avatarUrl]
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
		resolver: zodResolver(editAnimalEditorSchema),
		defaultValues: buildEmptyAnimalEditorValues()
	});

	useEffect(() => {
		if (!detailAnimal) {
			return;
		}
		if (lastHydratedDetailIdRef.current === detailAnimal.id) {
			return;
		}
		lastHydratedDetailIdRef.current = detailAnimal.id;
		reset(buildEditAnimalEditorValues(detailAnimal));
		setUploadedUrl(detailAnimal.avatarUrl ? getMediaUrl(detailAnimal.avatarUrl) : null);
	}, [detailAnimal, reset, setUploadedUrl]);

	const selectedLabelIds = watch('labelIds') ?? [];
	const selectedStatus = watch('status');
	const selectedCuratorId = watch('curatorId');
	const selectedCost = watch('costOfGuardianship');
	const role = session?.user.role;
	const canManage = role === UserRole.ADMIN || role === UserRole.SENIOR_VOLUNTEER;
	const canEdit = useCanEditAnimal({ curatorId: detailAnimal?.curatorId ?? null });

	useEffect(() => {
		if (!detailAnimal || location.hash !== '#gallery') return;
		const timer = window.setTimeout(() => {
			const node = document.getElementById('gallery');
			if (node) {
				node.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 0);
		return () => window.clearTimeout(timer);
	}, [detailAnimal, location.hash]);

	const isBusy =
		isSubmitting ||
		isUploading ||
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
			toast.error(message);
		}
	};

	const onSubmit = async (values: AnimalEditorValues): Promise<void> => {
		if (!detailAnimal || !id) {
			return;
		}
		if (!canEdit) {
			toast.error('Недостаточно прав для редактирования');
			return;
		}
		try {
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
					payload: { status: selectedStatus as AnimalStatusEnum }
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

			const labelsToAssign = [...nextLabelIds].filter((labelId) => !initialLabelIds.has(labelId));
			const labelsToUnassign = [...initialLabelIds].filter((labelId) => !nextLabelIds.has(labelId));

			await Promise.all([
				...labelsToAssign.map((labelId) =>
					assignLabelMutation.mutateAsync({ id: detailAnimal.id, payload: { labelId } })
				),
				...labelsToUnassign.map((labelId) =>
					unassignLabelMutation.mutateAsync({ animalId: detailAnimal.id, labelId })
				)
			]);

			toast.success('Изменения сохранены');
			navigate(ROUTES.animalDetails.replace(':id', detailAnimal.id));
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	const handleDelete = async (): Promise<void> => {
		if (!detailAnimal || !canManage) {
			return;
		}
		const isConfirmed = window.confirm(`Удалить животное "${detailAnimal.name}"? Действие нельзя отменить.`);
		if (!isConfirmed) {
			return;
		}

		try {
			await deleteMutation.mutateAsync(detailAnimal.id);
			toast.success('Животное удалено');
			navigate(ROUTES.animals);
		} catch (error) {
			const message = await getErrorMessage(error);
			toast.error(message);
		}
	};

	if (!id) {
		return (
			<ErrorState description="Некорректный идентификатор животного." onRetry={() => navigate(ROUTES.animals)} />
		);
	}

	if (isDetailPending) {
		return (
			<div className="flex items-center justify-center min-h-100">
				<Loader2 className="animate-spin text-(--color-brand-orange)" size={40} />
			</div>
		);
	}

	if (isDetailError || !detailAnimal) {
		return (
			<ErrorState
				description={detailError?.message ?? 'Карточка животного не найдена.'}
				onRetry={() => void refetchDetail()}
			/>
		);
	}

	return (
		<div className="space-y-6 pb-10">
			<PageTitle title={`Редактирование: ${detailAnimal.name}`} subtitle="Изменение данных животного.">
				<Button
					type="button"
					appearance="ghost"
					className="mt-0 md:w-auto px-6 py-2"
					onClick={() => navigate(ROUTES.animalDetails.replace(':id', detailAnimal.id))}>
					Вернуться в карточку
				</Button>
			</PageTitle>

			<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6">
				<div className="flex items-center gap-4">
					<AnimalAvatar animal={detailAnimal} width={96} height={96} rounded />
					<div className="space-y-2">
						<p className="text-xl font-semibold">{detailAnimal.name}</p>
						<AnimalStatusBadge status={detailAnimal.status} />
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-5">
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
				</div>

				<section
					id="gallery"
					className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 scroll-mt-6">
					<AnimalGalleryEditor
						animalId={detailAnimal.id}
						galleryUrls={detailAnimal.galleryUrls}
						disabled={!canEdit}
					/>
				</section>

				<div className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6">
					<AnimalEditPropsBlock
						setLabels={(labels) => setValue('labelIds', labels)}
						control={control}
						register={register}
						selectedLabelIds={selectedLabelIds}
						errors={errors}
					/>
				</div>

				<div className="flex flex-col md:flex-row justify-end gap-3">
					{canManage && (
						<Button
							type="button"
							appearance="red"
							className="mt-0 md:w-auto px-6 py-2 md:mr-auto"
							onClick={() => void handleDelete()}
							isLoading={deleteMutation.isPending}>
							Удалить
						</Button>
					)}
					<Button type="submit" className="mt-0 md:w-auto px-6 py-2" isLoading={isBusy} disabled={!canEdit}>
						Сохранить изменения
					</Button>
				</div>
			</form>
		</div>
	);
};

export default AnimalEditPage;
