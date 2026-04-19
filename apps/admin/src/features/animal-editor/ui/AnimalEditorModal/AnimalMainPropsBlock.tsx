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
import { UseFormRegister } from 'react-hook-form';
import { cn } from '../../../../shared/lib';
import { Input, Select, Textarea } from '../../../../shared/ui';
import { AnimalEditorValues } from '../../model/types';

interface Props extends HTMLAttributes<HTMLDivElement> {
	register: UseFormRegister<AnimalEditorValues>;
	gender?: AnimalGenderEnum;
}

export const AnimalMainPropsBlock = ({ register, gender, className, ...props }: Props): JSX.Element => {
	return (
		<div {...props} className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
			<Input placeholder="Сеня" {...register('name')} label="Имя" small />
			<Input {...register('birthDate')} type="date" label="Дата рождения" small />
			<Select
				{...register('species')}
				label="Вид"
				options={Object.values(AnimalSpeciesEnum).map((value) => ({ value, label: AnimalSpeciesNames[value] }))}
				small
			/>
			<Select
				{...register('gender')}
				label="Пол"
				options={Object.values(AnimalGenderEnum).map((value) => ({ value, label: AnimalGenderNames[value] }))}
				small
			/>
			<Select
				{...register('size')}
				label="Размер"
				options={Object.values(AnimalSizeEnum).map((value) => ({
					value,
					label: AnimalSizeNames[value][gender ?? AnimalGenderEnum.MALE]
				}))}
				small
			/>
			<Select
				{...register('coat')}
				label="Шерсть"
				options={Object.values(AnimalCoatEnum).map((value) => ({ value, label: AnimalCoatNames[value] }))}
				small
			/>
			<Input {...register('color')} placeholder="Черный" label="Окрас" small />

			<Textarea {...register('description')} label="Описание" rows={4} classNameBlock="md:col-span-2" />
		</div>
	);
};
