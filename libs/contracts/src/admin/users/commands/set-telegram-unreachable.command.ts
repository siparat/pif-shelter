import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const setTelegramUnreachableRequestSchema = z.object({
	unreachable: z
		.boolean()
		.describe('true — пометить, что Telegram недоступен (заблокировать); false — снять блокировку')
});

export class SetTelegramUnreachableRequestDto extends createZodDto(setTelegramUnreachableRequestSchema) {}

export const setTelegramUnreachableResponseSchema = createApiSuccessResponseSchema(
	z.object({
		userId: z.string(),
		telegramUnreachable: z.boolean()
	})
);

export class SetTelegramUnreachableResponseDto extends createZodDto(setTelegramUnreachableResponseSchema) {}
