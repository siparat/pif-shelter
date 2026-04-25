import { SetUserRoleResult } from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { api } from '../../../shared/api';

export interface SetUserRolePayload {
	userId: string;
	roleName: UserRole;
}

export const setUserRole = async (payload: SetUserRolePayload): Promise<SetUserRoleResult['data']> => {
	const response = await api
		.patch(`admin/users/${payload.userId}/role`, {
			json: { roleName: payload.roleName }
		})
		.json<SetUserRoleResult>();
	return response.data;
};
