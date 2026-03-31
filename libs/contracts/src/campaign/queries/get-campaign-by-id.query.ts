import { animalSchema, campaigns } from '@pif/database';
import { createSelectSchema } from 'drizzle-orm/zod';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common';

export const getCampaignByIdResponseSchema = createApiSuccessResponseSchema(
	createSelectSchema(campaigns)
		.omit({
			startsAt: true,
			endsAt: true,
			createdAt: true,
			updatedAt: true,
			deletedAt: true
		})
		.extend({
			startsAt: z.iso.datetime(),
			endsAt: z.iso.datetime(),
			createdAt: z.iso.datetime(),
			updatedAt: z.iso.datetime(),
			deletedAt: z.iso.datetime().nullable(),
			animal: animalSchema.pick({
				id: true,
				name: true,
				avatarUrl: true,
				gender: true,
				status: true,
				species: true
			})
		})
);

export class GetCampaignByIdResponseDto extends createZodDto(getCampaignByIdResponseSchema) {}
