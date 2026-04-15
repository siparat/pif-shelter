import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common';

export const setCostOfGuardianshipRequestSchema = z.object({
	costOfGuardianship: z.nullable(z.coerce.number().positive().describe('Стоимость опекунства'))
});

export const setCostOfGuardianshipResponseSchema = createApiSuccessResponseSchema(
	z.object({
		animalId: z.uuid().describe('Уникальный идентификатор животного'),
		oldCost: z.nullable(z.number().positive()).describe('Старая стоимость опекунства'),
		newCost: z.nullable(z.number().positive()).describe('Новая стоимость опекунства')
	})
);
