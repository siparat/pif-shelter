import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const deleteAnimalResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);
