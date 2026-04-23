import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAdminUser } from '../api/admin-user.api';
import { adminUserKeys } from './query-keys';
import { AdminUser } from './types';

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
