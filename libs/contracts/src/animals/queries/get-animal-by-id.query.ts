import { animalWithLabelsSchema } from '@pif/database';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const getAnimalByIdRequestSchema = z.object({
	id: z.uuid().describe('Уникальный идентификатор животного')
});

export class GetAnimalByIdRequestDto extends createZodDto(getAnimalByIdRequestSchema) {}

export const getAnimalByIdResponseSchema = createApiSuccessResponseSchema(
	animalWithLabelsSchema.extend({
		createdAt: z.iso.datetime(),
		updatedAt: z.iso.datetime(),
		deletedAt: z.string().nullable()
	})
);
export class GetAnimalByIdResponseDto extends createZodDto(getAnimalByIdResponseSchema) {}
