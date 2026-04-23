import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const setUserBannedRequestSchema = z.object({
	banned: z.boolean().describe('true — заблокировать вход в систему, false — снять блокировку')
});

export const setUserBannedResponseSchema = createApiSuccessResponseSchema(
	z.object({
		userId: z.string(),
		banned: z.boolean()
	})
);

export type SetUserBannedRequest = z.infer<typeof setUserBannedRequestSchema>;
export type SetUserBannedResult = z.infer<typeof setUserBannedResponseSchema>;
