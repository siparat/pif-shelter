import { listPublicTeamUsersResponseSchema } from '@pif/contracts';
import { api } from '../../../shared/api/base';
import { TeamMember } from '../model/types';

export const getPublicTeamUsers = async (): Promise<TeamMember[]> => {
	const body = await api.get('admin/users/public').json();
	return listPublicTeamUsersResponseSchema.parse(body).data;
};
