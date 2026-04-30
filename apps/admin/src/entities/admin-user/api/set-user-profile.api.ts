import { SetUserProfileResult } from '@pif/contracts';
import { api } from '../../../shared/api';

export interface SetUserProfilePayload {
	userId: string;
	name: string;
	email: string;
	position: string;
	telegram: string;
}

export const setUserProfile = async (payload: SetUserProfilePayload): Promise<SetUserProfileResult['data']> => {
	const response = await api
		.patch(`admin/users/${payload.userId}/profile`, {
			json: {
				name: payload.name,
				email: payload.email,
				position: payload.position,
				telegram: payload.telegram
			}
		})
		.json<SetUserProfileResult>();
	return response.data;
};
