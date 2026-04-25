import { GetAdminUserResult, ListTeamUsersResult } from '@pif/contracts';

export type AdminUser = GetAdminUserResult['data'];
export type TeamUser = ListTeamUsersResult['data'][number];
