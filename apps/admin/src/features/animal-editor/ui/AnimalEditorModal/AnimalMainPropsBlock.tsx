import {
	AnimalCoatEnum,
	AnimalCoatNames,
	AnimalGenderEnum,
	AnimalGenderNames,
	AnimalSizeEnum,
	AnimalSizeNames,
	AnimalSpeciesEnum,
	AnimalSpeciesNames
} from '@pif/shared';
import { HTMLAttributes, JSX } from 'react';
import { Control, Controller, FieldErrors, UseFormRegister } from 'react-hook-form';
import { cn } from '../../../../shared/lib';
import { Input, Select, Textarea } from '../../../../shared/ui';
import { AnimalEditorValues } from '../../model/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
	control: Control<AnimalEditorValues>;
	register: UseFormRegister<AnimalEditorValues>;
	gender?: AnimalGenderEnum;
	errors: FieldErrors<AnimalEditorValues>;
}

export const AnimalMainPropsBlock = ({
	control,
	register,
	errors,
	gender,
	className,
	...props
}: Props): JSX.Element => {
	return (
		<div {...props} className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
			<Input error={errors.name?.message} placeholder="Сеня" {...register('name')} label="Имя" small />
			<Input
				error={errors.birthDate?.message}
				{...register('birthDate')}
				type="date"
				label="Дата рождения"
				small
			/>
			<Controller
				control={control}
				name="species"
				render={({ field }) => (
					<Select
						{...field}
						error={errors.species?.message}
						label="Вид"
						options={Object.values(AnimalSpeciesEnum).map((species) => ({
							value: species,
							label: AnimalSpeciesNames[species]
						}))}
						small
					/>
				)}
			/>
			<Controller
				control={control}
				name="gender"
				render={({ field }) => (
					<Select
						{...field}
						error={errors.gender?.message}
						label="Пол"
						options={Object.values(AnimalGenderEnum).map((animalGender) => ({
							value: animalGender,
							label: AnimalGenderNames[animalGender]
						}))}
						small
					/>
				)}
			/>
			<Controller
				control={control}
				name="size"
				render={({ field }) => (
					<Select
						{...field}
						error={errors.size?.message}
						label="Размер"
						options={Object.values(AnimalSizeEnum).map((size) => ({
							value: size,
							label: AnimalSizeNames[size][gender ?? AnimalGenderEnum.MALE]
						}))}
						small
					/>
				)}
			/>
			<Controller
				control={control}
				name="coat"
				render={({ field }) => (
					<Select
						{...field}
						error={errors.coat?.message}
						label="Шерсть"
						options={Object.values(AnimalCoatEnum).map((coat) => ({
							value: coat,
							label: AnimalCoatNames[coat]
						}))}
						small
					/>
				)}
			/>
			<Input error={errors.color?.message} {...register('color')} placeholder="Черный" label="Окрас" small />

			<Textarea
				error={errors.description?.message}
				{...register('description')}
				label="Описание"
				rows={4}
				classNameBlock="md:col-span-2"
			/>
		</div>
	);
};
