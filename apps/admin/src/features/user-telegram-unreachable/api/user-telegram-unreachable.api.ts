import { SetTelegramUnreachableResult } from '@pif/contracts';
import { api } from '../../../shared/api';

export interface SetTelegramUnreachablePayload {
	userId: string;
	unreachable: boolean;
}

export const setUserTelegramUnreachable = async (
	payload: SetTelegramUnreachablePayload
): Promise<SetTelegramUnreachableResult['data']> => {
	const response = await api
		.patch(`admin/users/${payload.userId}/telegram-unreachable`, {
			json: { unreachable: payload.unreachable }
		})
		.json<SetTelegramUnreachableResult>();
	return response.data;
};
