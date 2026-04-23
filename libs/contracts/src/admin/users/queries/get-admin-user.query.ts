import { UserRole } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const getAdminUserResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.string(),
		name: z.string(),
		email: z.string(),
		image: z.string().nullable(),
		role: z.enum(UserRole),
		position: z.string(),
		banned: z.boolean(),
		telegram: z.string(),
		telegramChatId: z.string().nullable(),
		telegramUnreachable: z.boolean(),
		createdAt: z.string(),
		updatedAt: z.string().nullable()
	})
);

export type GetAdminUserResult = z.infer<typeof getAdminUserResponseSchema>;
