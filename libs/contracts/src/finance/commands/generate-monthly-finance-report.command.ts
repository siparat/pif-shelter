import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const generateMonthlyFinanceReportRequestSchema = z.object({
	year: z.coerce.number().int().min(2000).max(2100),
	month: z.coerce.number().int().min(1).max(12),
	forceRegenerate: z.coerce.boolean().optional().default(false)
});

export const generateMonthlyFinanceReportResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid(),
		storageKey: z.string().nullable(),
		reused: z.boolean()
	})
);
