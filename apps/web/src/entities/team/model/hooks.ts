import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPublicTeamUsers } from '../api/team.api';
import { TeamMember } from '..';

export const teamQueryKeys = {
	root: ['team'] as const,
	list: () => [...teamQueryKeys.root, 'list'] as const
};

export const useTeamQuery = (): UseQueryResult<TeamMember[], Error> =>
	useQuery({
		queryKey: teamQueryKeys.list(),
		queryFn: getPublicTeamUsers,
		staleTime: 5 * 60 * 1000
	});
