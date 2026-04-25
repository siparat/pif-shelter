import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAdminUser } from '../api/admin-user.api';
import { listTeamUsers } from '../api/list-team-users.api';
import { adminUserKeys } from './query-keys';
import { AdminUser, TeamUser } from './types';

export const useAdminUser = (
	userId: string | null | undefined,
	options?: { enabled?: boolean }
): UseQueryResult<AdminUser, Error> => {
	const enabled = (options?.enabled ?? true) && Boolean(userId);
	return useQuery({
		queryKey: adminUserKeys.detail(userId ?? 'empty'),
		queryFn: () => getAdminUser(userId as string),
		enabled,
		retry: false,
		refetchOnWindowFocus: false
	});
};

export const useTeamUsers = (options?: {
	enabled?: boolean;
	includeGuardians?: boolean;
}): UseQueryResult<TeamUser[], Error> => {
	const includeGuardians = options?.includeGuardians ?? false;
	return useQuery({
		queryKey: adminUserKeys.list(includeGuardians),
		queryFn: () => listTeamUsers(includeGuardians),
		enabled: options?.enabled ?? true,
		retry: false,
		refetchOnWindowFocus: false
	});
};
