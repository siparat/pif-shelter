import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getGuardianProfile, getGuardianReports } from '../api/guardian.api';
import { guardianKeys } from './query-keys';
import { GuardianProfileData, GuardianReportsPage } from './types';

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

interface UseGuardianReportsOptions {
	page?: number;
	perPage?: number;
	enabled?: boolean;
}

export const useGuardianReports = (
	userId: string | null | undefined,
	options?: UseGuardianReportsOptions
): UseQueryResult<GuardianReportsPage, Error> => {
	const page = options?.page ?? 1;
	const perPage = options?.perPage ?? 10;
	return useQuery({
		queryKey: guardianKeys.reports(userId ?? 'empty', page, perPage),
		queryFn: () => getGuardianReports({ userId: userId as string, page, perPage }),
		enabled: Boolean(userId) && (options?.enabled ?? true),
		placeholderData: (prev) => prev,
		retry: false,
		refetchOnWindowFocus: false
	});
};
