import { animalCoatEnum, animalGenderEnum, animalSizeEnum, animalSpeciesEnum } from '@pif/database';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createAnimalSchema = z.object({
	name: z.string().min(2).max(50),
	species: z.enum(animalSpeciesEnum.enumValues),
	gender: z.enum(animalGenderEnum.enumValues),
	birthDate: z.coerce.date(),
	size: z.enum(animalSizeEnum.enumValues),
	coat: z.enum(animalCoatEnum.enumValues),
	color: z.string().min(2).max(30),
	description: z.string().max(5000).optional(),
	isSterilized: z.boolean().default(false),
	isVaccinated: z.boolean().default(false),
	isParasiteTreated: z.boolean().default(false)
});

export class CreateAnimalDto extends createZodDto(createAnimalSchema) {}
