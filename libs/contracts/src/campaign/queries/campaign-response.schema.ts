import { CampaignStatus } from '@pif/shared';
import { z } from 'zod';
import { animalWithLabelsSchema } from '../../common/schemas';

const campaignAnimalSchema = animalWithLabelsSchema
	.pick({
		id: true,
		name: true,
		avatarUrl: true,
		gender: true,
		status: true,
		species: true
	})
	.nullable();

export const campaignResponseSchema = z
	.object({
		id: z.uuid(),
		title: z.string(),
		description: z.string().nullable(),
		coverImageUrl: z.string().nullable().optional(),
		targetAmount: z.number().nullable().optional(),
		collectedAmount: z.number().optional(),
		status: z.enum(CampaignStatus),
		startsAt: z.iso.datetime(),
		endsAt: z.iso.datetime(),
		createdAt: z.iso.datetime(),
		updatedAt: z.iso.datetime(),
		deletedAt: z.iso.datetime().nullable(),
		animal: campaignAnimalSchema
	})
	.passthrough();

export type CampaignResponse = z.infer<typeof campaignResponseSchema>;
