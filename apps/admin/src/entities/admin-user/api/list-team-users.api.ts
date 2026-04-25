import { ListTeamUsersResult } from '@pif/contracts';
import { api } from '../../../shared/api';
import { TeamUser } from '../model/types';

export const listTeamUsers = async (includeGuardians = false): Promise<TeamUser[]> => {
	const response = await api
		.get('admin/users', {
			searchParams: {
				includeGuardians: includeGuardians ? 'true' : 'false'
			}
		})
		.json<ListTeamUsersResult>();
	return response.data;
};
