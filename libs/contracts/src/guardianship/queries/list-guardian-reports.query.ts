import { AnimalSpeciesEnum, PostMediaTypeEnum } from '@pif/shared';
import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common/base.responses';
import { paginationSchema } from '../../common/schemas/pagination.schema';

export const listGuardianReportsRequestSchema = paginationSchema.extend({
	userId: z.string().min(1).describe('ID пользователя-опекуна').optional()
});

const reportAnimalSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	avatarUrl: z.string().nullable(),
	species: z.enum(AnimalSpeciesEnum)
});

const reportMediaSchema = z.object({
	id: z.uuid(),
	storageKey: z.string(),
	type: z.enum(PostMediaTypeEnum),
	order: z.number().int().min(0)
});

export const listGuardianReportsItemSchema = z.object({
	id: z.uuid().describe('ID поста-отчёта'),
	title: z.string(),
	createdAt: z.string().describe('ISO дата публикации отчёта'),
	animal: reportAnimalSchema,
	media: z.array(reportMediaSchema)
});

export const listGuardianReportsResponseSchema = createApiPaginatedResponseSchema(listGuardianReportsItemSchema);

export type ListGuardianReportsRequest = z.input<typeof listGuardianReportsRequestSchema>;
export type ListGuardianReportsResult = z.infer<typeof listGuardianReportsResponseSchema>;
export type ListGuardianReportsItem = z.infer<typeof listGuardianReportsItemSchema>;
