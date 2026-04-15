import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { blacklistSourceSchema } from './blacklist-source.schema';

export const suspectContactsRequestSchema = z.object({
	reason: z.string().trim().min(2).max(1000),
	suspicionEndsAt: z.iso.datetime(),
	sources: z.array(blacklistSourceSchema).min(1)
});

export const suspectContactsResponseSchema = createApiSuccessResponseSchema(
	z.object({
		updated: z.number().int().nonnegative()
	})
);
