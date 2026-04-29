import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const publicReportCategoryEnum = z.enum(['FINANCE']);

export const publicReportFileTypeEnum = z.enum(['PDF', 'XLSX']);

export const publicReportSchema = z.object({
	id: z.string(),
	category: publicReportCategoryEnum,
	title: z.string(),
	year: z.number().int(),
	month: z.number().int().min(1).max(12).nullable(),
	fileType: publicReportFileTypeEnum,
	url: z.url()
});

export const listPublicReportsByYearQuerySchema = z.object({
	year: z.coerce.number().int().min(2000).max(2100)
});

export const listPublicReportsByYearResponseSchema = createApiSuccessResponseSchema(z.array(publicReportSchema));

export type PublicReport = z.infer<typeof publicReportSchema>;
export type PublicReportCategory = z.infer<typeof publicReportCategoryEnum>;
export type ListPublicReportsByYearResult = z.infer<typeof listPublicReportsByYearResponseSchema>;
