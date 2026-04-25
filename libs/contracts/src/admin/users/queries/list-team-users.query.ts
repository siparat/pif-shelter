import { UserRole } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const listTeamUsersQuerySchema = z.object({
	includeGuardians: z
		.preprocess((value) => {
			if (typeof value === 'boolean') {
				return value;
			}
			if (typeof value === 'string') {
				const normalized = value.trim().toLowerCase();
				if (normalized === 'true' || normalized === '1') {
					return true;
				}
				if (normalized === 'false' || normalized === '0' || normalized === '') {
					return false;
				}
			}
			if (typeof value === 'number') {
				if (value === 1) {
					return true;
				}
				if (value === 0) {
					return false;
				}
			}
			return value;
		}, z.boolean())
		.default(false)
});

export const teamUserSummarySchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	role: z.enum(UserRole),
	position: z.string(),
	telegram: z.string(),
	telegramUnreachable: z.boolean(),
	banned: z.boolean(),
	avatar: z.string().nullable(),
	createdAt: z.string()
});

export const listTeamUsersResponseSchema = createApiSuccessResponseSchema(z.array(teamUserSummarySchema));

export type ListTeamUsersQuery = z.infer<typeof listTeamUsersQuerySchema>;
export type ListTeamUsersResult = z.infer<typeof listTeamUsersResponseSchema>;
