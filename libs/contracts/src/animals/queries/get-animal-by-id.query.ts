import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { animalWithLabelsSchema } from '../../common/schemas';

export const getAnimalByIdRequestSchema = z.object({
	id: z.uuid().describe('Уникальный идентификатор животного')
});

export const getAnimalByIdResponseSchema = createApiSuccessResponseSchema(
	animalWithLabelsSchema.extend({
		createdAt: z.iso.datetime(),
		updatedAt: z.iso.datetime(),
		deletedAt: z.string().nullable()
	})
);
