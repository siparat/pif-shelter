import { api } from '../../../shared/api/base';
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
	} catch {
		return null;
	}
};
