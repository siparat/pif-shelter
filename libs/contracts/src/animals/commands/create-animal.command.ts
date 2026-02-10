import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createAnimalSchema = z.object({
	name: z
		.string('Не забудьте написать имя питомца')
		.min(2, 'Имя очень короткое')
		.max(50, { error: (e) => ({ message: `Имя не может быть длинее ${e.maximum} символов` }) }),
	species: z.enum(AnimalSpeciesEnum, 'Укажите вид питомца'),
	gender: z.enum(AnimalGenderEnum, 'Мальчик или девочка?'),
	birthDate: z.coerce.date('Дата рождения указана неправильно, пример: 2026-02-10'),
	size: z.enum(AnimalSizeEnum, 'Неправильно указан размер питомца'),
	coat: z.enum(AnimalCoatEnum, 'Неправильно указана шерсть питомца'),
	color: z
		.string('Напишите какого раскраса питомец')
		.min(2, 'Указаный раскрас невалидный')
		.max(30, { error: (e) => ({ message: `Раскрас не может быть длинее ${e.maximum} символов` }) }),
	description: z
		.string('Расскажите о питомце')
		.max(5000, { error: (e) => ({ message: `Превышен лимит по символам ${e.maximum}` }) })
		.optional(),
	isSterilized: z.boolean('Стерилизован?').default(false).optional(),
	isVaccinated: z.boolean('Вакцинирован?').default(false).optional(),
	isParasiteTreated: z.boolean('Вылечен от паразитов?').default(false).optional()
});

export class CreateAnimalDto extends createZodDto(createAnimalSchema) {}
