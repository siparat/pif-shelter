import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const deleteManualExpenseRequestSchema = z.object({
	id: z.uuid()
});

export const deleteManualExpenseResponseSchema = createApiSuccessResponseSchema(
	z.object({
		success: z.literal(true)
	})
);
