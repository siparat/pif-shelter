import { createSelectSchema } from 'drizzle-orm/zod';
import z from 'zod';
import { users } from '../schemas';

export const userSchema = createSelectSchema(users)
	.omit({
		createdAt: true,
		updatedAt: true,
		deletedAt: true
	})
	.extend({
		createdAt: z.iso.datetime(),
		updatedAt: z.iso.datetime().nullable(),
		deletedAt: z.iso.datetime().nullable()
	});
export type User = z.infer<typeof userSchema>;
