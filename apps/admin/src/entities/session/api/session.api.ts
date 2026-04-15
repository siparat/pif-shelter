import { api } from '../../../shared/api';
import { HTTPError } from 'ky';
import { UnauthorizedError } from '../../../shared/api';
import { IUser } from '../model/types';

export interface ISessionResponse {
	user: IUser;
	session: {
		id: string;
		userId: string;
		expiresAt: string;
	};
}

export const getSession = async (): Promise<ISessionResponse | null> => {
	try {
		return await api.get('auth/get-session').json<ISessionResponse>();
	} catch (error) {
		if (error instanceof HTTPError && error.response.status === 401) {
			return null;
		}
		throw new UnauthorizedError('Ошибка проверки сессии');
	}
};
