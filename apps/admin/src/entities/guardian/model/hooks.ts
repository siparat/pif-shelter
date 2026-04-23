import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getGuardianProfile } from '../api/guardian.api';
import { guardianKeys } from './query-keys';
import { GuardianProfileData } from './types';

export const useGuardianProfile = (
	userId: string | null | undefined,
	options?: { enabled?: boolean }
): UseQueryResult<GuardianProfileData, Error> => {
	return useQuery({
		queryKey: guardianKeys.profile(userId ?? 'empty'),
		queryFn: () => getGuardianProfile(userId as string),
		enabled: Boolean(userId) && (options?.enabled ?? true),
		retry: false,
		refetchOnWindowFocus: false
	});
};
