import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const cancelGuardianshipByTokenRequestSchema = z.object({
	token: z.uuid().describe('Токен отмены из ссылки в письме')
});

export class CancelGuardianshipByTokenRequestDto extends createZodDto(cancelGuardianshipByTokenRequestSchema) {}

export const cancelGuardianshipByTokenResponseSchema = createApiSuccessResponseSchema(
	z.object({
		guardianshipId: z.uuid().describe('Уникальный идентификатор отменённого опекунства')
	})
);

export class CancelGuardianshipByTokenResponseDto extends createZodDto(cancelGuardianshipByTokenResponseSchema) {}
