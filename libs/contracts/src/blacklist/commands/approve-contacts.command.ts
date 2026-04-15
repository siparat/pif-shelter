import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common';
import { blacklistSourceSchema } from './blacklist-source.schema';

export const approveContactsRequestSchema = z.object({
	sources: z.array(blacklistSourceSchema).min(1)
});

export const approveContactsResponseSchema = createApiSuccessResponseSchema(
	z.object({
		updated: z.number().int().nonnegative()
	})
);
