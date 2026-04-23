import { SetUserBannedResult } from '@pif/contracts';
import { api } from '../../../shared/api';

export interface SetUserBannedPayload {
	userId: string;
	banned: boolean;
}

export const setUserBanned = async (payload: SetUserBannedPayload): Promise<SetUserBannedResult['data']> => {
	const response = await api
		.patch(`admin/users/${payload.userId}/banned`, {
			json: { banned: payload.banned }
		})
		.json<SetUserBannedResult>();
	return response.data;
};
