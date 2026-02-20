import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const createAnimalRequestSchema = z.object({
	name: z
		.string('Не забудьте написать имя питомца')
		.trim()
		.min(2, 'Имя очень короткое')
		.max(50, { error: (e) => ({ message: `Имя не может быть длинее ${e.maximum} символов` }) })
		.describe('Имя питомца'),
	species: z.enum(AnimalSpeciesEnum, 'Укажите вид питомца').describe('Вид животного'),
	gender: z.enum(AnimalGenderEnum, 'Мальчик или девочка?').describe('Пол животного'),
	birthDate: z.iso.date().describe('Дата рождения питомца в формате YYYY-MM-DD'),
	size: z.enum(AnimalSizeEnum, 'Неправильно указан размер питомца').describe('Размер питомца'),
	coat: z.enum(AnimalCoatEnum, 'Неправильно указана шерсть питомца').describe('Тип шерсти'),
	color: z
		.string('Напишите какого раскраса питомец')
		.trim()
		.min(2, 'Указаный раскрас невалидный')
		.max(30, { error: (e) => ({ message: `Раскрас не может быть длинее ${e.maximum} символов` }) })
		.describe('Окрас питомца'),
	description: z
		.string('Расскажите о питомце')
		.trim()
		.max(5000, { error: (e) => ({ message: `Превышен лимит по символам ${e.maximum}` }) })
		.optional()
		.describe('История жизни питомца (текст с форматированием \\n)'),
	isSterilized: z.boolean('Стерилизован?').default(false).optional().describe('Флаг: стерилизовано ли животное'),
	isVaccinated: z.boolean('Вакцинирован?').default(false).optional().describe('Флаг: сделаны ли прививки'),
	isParasiteTreated: z
		.boolean('Вылечен от паразитов?')
		.default(false)
		.optional()
		.describe('Флаг: обработано ли от паразитов'),
	avatarKey: z
		.string('Аватар должен быть обязательно')
		.trim()
		.min(1, 'Укажите аватар')
		.describe('Ключ главного фото в хранилище')
});

export class CreateAnimalRequestDto extends createZodDto(createAnimalRequestSchema) {}

export const createAnimalResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Уникальный идентификатор созданного питомца')
	})
);

export class CreateAnimalResponseDto extends createZodDto(createAnimalResponseSchema) {}
