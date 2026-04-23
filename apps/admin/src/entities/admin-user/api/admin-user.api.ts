import { GetAdminUserResult } from '@pif/contracts';
import { api } from '../../../shared/api';
import { AdminUser } from '../model/types';

export const getAdminUser = async (userId: string): Promise<AdminUser> => {
	const response = await api.get(`admin/users/${userId}`).json<GetAdminUserResult>();
	return response.data;
};
