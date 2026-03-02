import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const cancelGuardianshipRequestSchema = z.object({
	guardianshipId: z.uuid().describe('Уникальный идентификатор опекунства, которое нужно отменить')
});

export class CancelGuardianshipRequestDto extends createZodDto(cancelGuardianshipRequestSchema) {}

export const cancelGuardianshipResponseSchema = createApiSuccessResponseSchema(
	z.object({
		guardianshipId: z.uuid().describe('Уникальный идентификатор отменённого опекунства')
	})
);

export class CancelGuardianshipResponseDto extends createZodDto(cancelGuardianshipResponseSchema) {}
