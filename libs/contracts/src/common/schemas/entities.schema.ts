import { AnimalGenderEnum, AnimalSpeciesEnum, AnimalStatusEnum, GuardianshipStatusEnum } from '@pif/shared';
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
		labels: z.array(animalLabelSchema).optional()
	})
	.loose();

export const guardianshipViewSchema = z
	.object({
		id: z.uuid(),
		animalId: z.uuid(),
		status: z.enum(GuardianshipStatusEnum),
		paidPeriodEndAt: z.union([z.string(), z.date()]).nullable()
	})
	.loose();

export const guardianshipWithAnimalSchema = guardianshipViewSchema
	.extend({
		animal: animalWithLabelsSchema
	})
	.loose();
