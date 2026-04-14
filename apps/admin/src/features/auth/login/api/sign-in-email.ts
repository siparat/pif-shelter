import { api } from '../../../../shared/api/base';
import { LoginFormValues } from '../model/login.schema';

export interface LoginResponse {
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
	};
	session: {
		id: string;
		token: string;
	};
	token: string;
}

export const signInEmail = async (values: LoginFormValues): Promise<LoginResponse> => {
	return await api
		.post('auth/sign-in/email', {
			json: values
		})
		.json<LoginResponse>();
};
