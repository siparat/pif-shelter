import { listPublicTeamUsersResponseSchema } from '@pif/contracts';
import { z } from 'zod';

export type TeamMember = z.infer<typeof listPublicTeamUsersResponseSchema>['data'][number];
