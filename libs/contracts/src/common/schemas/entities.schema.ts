import {
	AnimalCoatEnum,
	AnimalGenderEnum,
	AnimalSizeEnum,
	AnimalSpeciesEnum,
	AnimalStatusEnum,
	GuardianshipStatusEnum
} from '@pif/shared';
import { z } from 'zod';

export const animalLabelSchema = z
	.object({
		id: z.uuid(),
		name: z.string(),
		color: z.string()
	})
	.loose();

export const animalWithLabelsSchema = z
	.object({
		id: z.uuid(),
		name: z.string(),
		description: z.string().nullable(),
		avatarUrl: z.string().nullable(),
		galleryUrls: z.array(z.string()).nullable(),
		gender: z.enum(AnimalGenderEnum),
		status: z.enum(AnimalStatusEnum),
		species: z.enum(AnimalSpeciesEnum),
		labels: z.array(animalLabelSchema).optional(),
		birthDate: z.iso.date(),
		size: z.enum(AnimalSizeEnum),
		coat: z.enum(AnimalCoatEnum),
		color: z.string(),
		tags: z.array(z.string()).nullable(),
		isSterilized: z.boolean(),
		isVaccinated: z.boolean(),
		isParasiteTreated: z.boolean(),
		costOfGuardianship: z.number().nullable(),
		curatorId: z.string().nullable()
	})
	.loose();

export const guardianshipViewSchema = z
	.object({
		id: z.uuid(),
		animalId: z.uuid(),
		status: z.enum(GuardianshipStatusEnum),
		paidPeriodEndAt: z.string().nullable()
	})
	.loose();

export const guardianshipWithAnimalSchema = guardianshipViewSchema
	.extend({
		animal: animalWithLabelsSchema
	})
	.loose();
