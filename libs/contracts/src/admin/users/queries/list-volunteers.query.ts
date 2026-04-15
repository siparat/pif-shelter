import { UserRole } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const volunteerSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	role: z.enum(UserRole),
	position: z.string(),
	telegram: z.string(),
	telegramUnreachable: z.boolean(),
	avatar: z.string().nullable()
});

export const listVolunteersResponseSchema = createApiSuccessResponseSchema(z.array(volunteerSummarySchema));
