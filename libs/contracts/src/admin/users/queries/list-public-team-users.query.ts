import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const publicTeamUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	position: z.string(),
	telegram: z.string(),
	avatar: z.string().nullable()
});

export const listPublicTeamUsersResponseSchema = createApiSuccessResponseSchema(z.array(publicTeamUserSchema));

export type PublicTeamUser = z.infer<typeof publicTeamUserSchema>;
export type ListPublicTeamUsersResult = z.infer<typeof listPublicTeamUsersResponseSchema>;
