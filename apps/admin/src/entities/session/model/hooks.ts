import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getSession, ISessionResponse } from '../api/session.api';

export const useSession = (): UseQueryResult<ISessionResponse | null, Error> => {
	return useQuery({
		queryKey: ['session'],
		queryFn: getSession,
		retry: false,
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true
	});
};
