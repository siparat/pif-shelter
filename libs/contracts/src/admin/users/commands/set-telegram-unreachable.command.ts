import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const setTelegramUnreachableRequestSchema = z.object({
	unreachable: z
		.boolean()
		.describe('true — пометить, что Telegram недоступен (заблокировать); false — снять блокировку')
});

export const setTelegramUnreachableResponseSchema = createApiSuccessResponseSchema(
	z.object({
		userId: z.string(),
		telegramUnreachable: z.boolean()
	})
);

export type SetTelegramUnreachableRequest = z.infer<typeof setTelegramUnreachableRequestSchema>;
export type SetTelegramUnreachableResult = z.infer<typeof setTelegramUnreachableResponseSchema>;
