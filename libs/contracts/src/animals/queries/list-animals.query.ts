import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum, AnimalStatusEnum } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common/base.responses';
import { paginationSchema } from '../../common/schemas/pagination.schema';
import { animalSummarySchema } from '../response.dto';

export const listAnimalsRequestSchema = paginationSchema.extend({
	status: z.enum(AnimalStatusEnum).optional(),
	species: z.enum(AnimalSpeciesEnum).optional(),
	gender: z.enum(AnimalGenderEnum).optional(),
	size: z.enum(AnimalSizeEnum).optional(),
	coat: z.enum(AnimalCoatEnum).optional(),
	isSterilized: z.coerce.boolean().optional(),
	isVaccinated: z.coerce.boolean().optional(),
	isParasiteTreated: z.coerce.boolean().optional(),
	minAge: z.coerce.number().min(0).optional(),
	maxAge: z.coerce.number().min(0).optional()
});

export class ListAnimalsRequestDto extends createZodDto(listAnimalsRequestSchema) {}

export const listAnimalsResponseSchema = createApiPaginatedResponseSchema(animalSummarySchema);
export class ListAnimalsResponseDto extends createZodDto(listAnimalsResponseSchema) {}

export type ListAnimalsResult = Omit<ListAnimalsResponseDto, 'success'>;
