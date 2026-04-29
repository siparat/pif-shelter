import { ListPublicTeamUsersResult } from '@pif/contracts';
import { api } from '../../../shared/api/base';
import { TeamMember } from '../model/types';

export const getPublicTeamUsers = async (): Promise<TeamMember[]> => {
	const response = await api.get('admin/users/public').json<ListPublicTeamUsersResult>();
	return response.data;
};
