import { SetUserAvatarResult } from '@pif/contracts';
import { api } from '../../../shared/api';

export interface SetUserAvatarPayload {
	userId: string;
	avatarKey: string;
}

export const setUserAvatar = async (payload: SetUserAvatarPayload): Promise<SetUserAvatarResult['data']> => {
	const response = await api
		.patch(`admin/users/${payload.userId}/avatar`, {
			json: { avatarKey: payload.avatarKey }
		})
		.json<SetUserAvatarResult>();
	return response.data;
};
