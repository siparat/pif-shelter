import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { createAnimalRequestSchema } from './create-animal.command';

export const updateAnimalRequestSchema = createAnimalRequestSchema.partial();

export const updateAnimalResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);
