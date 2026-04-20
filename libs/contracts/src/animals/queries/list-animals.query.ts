import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum, AnimalStatusEnum } from '@pif/shared';
import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common/base.responses';
import { paginationSchema } from '../../common/schemas/pagination.schema';
import { animalSummarySchema } from '../response.dto';

const queryBooleanSchema = z.preprocess((value) => {
	if (typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'string') {
		const normalized = value.trim().toLowerCase();
		if (normalized === 'true') {
			return true;
		}
		if (normalized === 'false') {
			return false;
		}
	}
	return value;
}, z.boolean());

export const listAnimalsRequestSchema = paginationSchema.extend({
	status: z.enum(AnimalStatusEnum).optional(),
	species: z.enum(AnimalSpeciesEnum).optional(),
	gender: z.enum(AnimalGenderEnum).optional(),
	size: z.enum(AnimalSizeEnum).optional(),
	coat: z.enum(AnimalCoatEnum).optional(),
	isSterilized: queryBooleanSchema.optional(),
	isVaccinated: queryBooleanSchema.optional(),
	isParasiteTreated: queryBooleanSchema.optional(),
	minAge: z.coerce.number().min(0).optional(),
	maxAge: z.coerce.number().min(0).optional()
});

export const listAnimalsResponseSchema = createApiPaginatedResponseSchema(animalSummarySchema);

export type ListAnimalsResult = Omit<z.infer<typeof listAnimalsResponseSchema>, 'success'>;
