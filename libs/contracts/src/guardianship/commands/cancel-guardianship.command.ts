import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const cancelGuardianshipRequestSchema = z.object({
	guardianshipId: z.uuid().describe('Уникальный идентификатор опекунства, которое нужно отменить'),
	reason: z.string().min(1).max(255).describe('Причина отмены')
});

export const cancelGuardianshipResponseSchema = createApiSuccessResponseSchema(
	z.object({
		guardianshipId: z.uuid().describe('Уникальный идентификатор отменённого опекунства')
	})
);
