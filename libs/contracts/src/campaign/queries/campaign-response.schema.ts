import { animalSchema, campaigns } from '@pif/database';
import { createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';

export const campaignResponseSchema = createSelectSchema(campaigns)
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
		animal: animalSchema
			.pick({
				id: true,
				name: true,
				avatarUrl: true,
				gender: true,
				status: true,
				species: true
			})
			.nullable()
	});
