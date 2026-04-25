import { UserRole } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const setUserRoleRequestSchema = z.object({
	roleName: z.enum(UserRole)
});

export const setUserRoleResponseSchema = createApiSuccessResponseSchema(
	z.object({
		userId: z.string(),
		roleName: z.enum(UserRole)
	})
);

export type SetUserRoleRequest = z.infer<typeof setUserRoleRequestSchema>;
export type SetUserRoleResult = z.infer<typeof setUserRoleResponseSchema>;
