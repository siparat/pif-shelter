import { AnimalStatusEnum } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const changeAnimalStatusRequestSchema = z.object({
	status: z.enum(AnimalStatusEnum).describe('Новый статус животного')
});

export const changeAnimalStatusResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid(),
		status: z.enum(AnimalStatusEnum)
	})
);
