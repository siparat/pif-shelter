import { zodResolver } from '@hookform/resolvers/zod';
import { listAnimalsRequestSchema } from '@pif/contracts';
import {
	AnimalCoatEnum,
	AnimalCoatNames,
	AnimalGenderEnum,
	AnimalGenderNames,
	AnimalSizeEnum,
	AnimalSizeNames,
	AnimalSpeciesEnum,
	AnimalSpeciesNames,
	AnimalStatusEnum,
	AnimalStatusNames
} from '@pif/shared';
import { Search } from 'lucide-react';
import { JSX, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AnimalsListParams } from '../../../../entities/animal';
import { VolunteerOption } from '../../../../entities/volunteer';
import { Button, Checkbox, Input, Select } from '../../../../shared/ui';

const animalsFiltersSchema = listAnimalsRequestSchema.pick({
	q: true,
	sort: true,
	status: true,
	species: true,
	gender: true,
	size: true,
	coat: true,
	curatorId: true,
	isSterilized: true,
	isVaccinated: true,
	isParasiteTreated: true,
	minAge: true,
	maxAge: true
});

type AnimalsFiltersFormValues = z.input<typeof animalsFiltersSchema>;

interface Props {
	initialValues: AnimalsListParams;
	volunteers: VolunteerOption[];
	isLoading: boolean;
	onApply: (values: Partial<AnimalsListParams>) => void;
	onReset: () => void;
}

const STATUS_OPTIONS = Object.values(AnimalStatusEnum).map((value) => ({
	value,
	label: AnimalStatusNames[value]
}));

const SPECIES_OPTIONS = Object.values(AnimalSpeciesEnum).map((value) => ({
	value,
	label: AnimalSpeciesNames[value]
}));

const GENDER_OPTIONS = Object.values(AnimalGenderEnum).map((value) => ({
	value,
	label: AnimalGenderNames[value]
}));

const SIZE_OPTIONS = Object.values(AnimalSizeEnum).map((value) => ({
	value,
	label: AnimalSizeNames[value][AnimalGenderEnum.MALE]
}));

const COAT_OPTIONS = Object.values(AnimalCoatEnum).map((value) => ({
	value,
	label: AnimalCoatNames[value]
}));

const SORT_OPTIONS = [
	{ value: 'createdAt:desc', label: 'Сначала новые' },
	{ value: 'createdAt:asc', label: 'Сначала старые' },
	{ value: 'birthDate:desc', label: 'Сначала младше' },
	{ value: 'birthDate:asc', label: 'Сначала старше' },
	{ value: 'name:asc', label: 'Имя А-Я' },
	{ value: 'name:desc', label: 'Имя Я-А' }
];

export const AnimalsFilters = ({ initialValues, volunteers, isLoading, onApply, onReset }: Props): JSX.Element => {
	const {
		handleSubmit,
		reset,
		control,
		watch,
		formState: { errors }
	} = useForm<AnimalsFiltersFormValues>({
		resolver: zodResolver(animalsFiltersSchema),
		defaultValues: initialValues
	});

	useEffect(() => {
		reset(initialValues);
	}, [initialValues, reset]);

	const onSubmit = (values: AnimalsFiltersFormValues): void => {
		if (isInvalidAgeRange) {
			return;
		}
		onApply(values);
	};

	const minAgeValue = watch('minAge', 0) || null;
	const maxAgeValue = watch('maxAge', 0) || null;
	const isInvalidAgeRange =
		typeof minAgeValue == 'number' && typeof maxAgeValue == 'number' && minAgeValue > maxAgeValue;

	console.log(errors);

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="rounded-2xl border border-(--color-border) bg-(--color-bg-secondary) p-4 md:p-6 space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
				<Controller
					control={control}
					name="q"
					render={({ field: { value, ...field } }) => (
						<Input
							{...field}
							value={value ?? ''}
							Icon={Search}
							label="Поиск"
							classNameBlock="lg:col-span-2"
							placeholder="Имя, описание, окрас"
						/>
					)}
				/>

				<Controller
					control={control}
					name="status"
					render={({ field: { value, ...field } }) => (
						<Select
							{...field}
							value={value ?? ''}
							placeholder="Любой статус"
							label="Статус"
							options={STATUS_OPTIONS}
						/>
					)}
				/>

				<Controller
					control={control}
					name="species"
					render={({ field: { value, ...field } }) => (
						<Select
							{...field}
							value={value ?? ''}
							placeholder="Любой вид"
							label="Вид"
							options={SPECIES_OPTIONS}
						/>
					)}
				/>

				<Controller
					control={control}
					name="gender"
					render={({ field: { value, ...field } }) => (
						<Select
							{...field}
							value={value ?? ''}
							placeholder="Любой пол"
							label="Пол"
							options={GENDER_OPTIONS}
						/>
					)}
				/>

				<Controller
					control={control}
					name="sort"
					render={({ field: { value, ...field } }) => (
						<Select
							{...field}
							value={value ?? 'createdAt:desc'}
							label="Сортировка"
							options={SORT_OPTIONS}
						/>
					)}
				/>
				<Controller
					control={control}
					name="curatorId"
					render={({ field: { value, ...field } }) => (
						<Select
							{...field}
							value={value ?? ''}
							placeholder="Любой куратор"
							label="Куратор"
							options={volunteers.map((volunteer) => ({ value: volunteer.id, label: volunteer.name }))}
						/>
					)}
				/>

				<Controller
					control={control}
					name="coat"
					render={({ field: { value, ...field } }) => (
						<Select
							{...field}
							value={value ?? ''}
							placeholder="Любая шерсть"
							label="Шерсть"
							options={COAT_OPTIONS}
						/>
					)}
				/>
				<Controller
					control={control}
					name="size"
					render={({ field: { value, ...field } }) => (
						<Select
							{...field}
							value={value ?? ''}
							placeholder="Любой размер"
							label="Размер"
							options={SIZE_OPTIONS}
						/>
					)}
				/>
				<Controller
					control={control}
					name="minAge"
					render={({ field: { value, ...field } }) => (
						<Input
							{...field}
							value={value ? Number(value) : ''}
							label="Возраст от"
							type="number"
							min={0}
							max={100}
							placeholder="0"
						/>
					)}
				/>
				<Controller
					control={control}
					name="maxAge"
					render={({ field: { value, ...field } }) => (
						<Input
							{...field}
							value={value ? Number(value) : ''}
							label="Возраст до"
							type="number"
							min={0}
							max={100}
							placeholder="4"
						/>
					)}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<Controller
					control={control}
					name="isSterilized"
					render={({ field: { value, ...field } }) => (
						<Checkbox
							{...field}
							checked={Boolean(value)}
							label="Стерилизован"
							description="Показать только стерилизованных"
						/>
					)}
				/>
				<Controller
					control={control}
					name="isVaccinated"
					render={({ field: { value, ...field } }) => (
						<Checkbox
							{...field}
							checked={Boolean(value)}
							label="Вакцинирован"
							description="Показать только вакцинированных"
						/>
					)}
				/>
				<Controller
					control={control}
					name="isParasiteTreated"
					render={({ field: { value, ...field } }) => (
						<Checkbox
							{...field}
							checked={Boolean(value)}
							label="Обработан от паразитов"
							description="Показать обработанных животных"
						/>
					)}
				/>
			</div>

			{isInvalidAgeRange && (
				<p className="text-sm text-red-500">Минимальный возраст не может быть больше максимального.</p>
			)}

			<div className="flex flex-col md:flex-row gap-3 md:justify-end">
				<Button
					type="button"
					appearance="ghost"
					className="mt-0 md:w-auto px-6 py-2"
					onClick={() => {
						onReset();
						reset({});
					}}>
					Сбросить
				</Button>
				<Button type="submit" className="mt-0 md:w-auto px-6 py-2" disabled={isLoading || isInvalidAgeRange}>
					Применить
				</Button>
			</div>
		</form>
	);
};
