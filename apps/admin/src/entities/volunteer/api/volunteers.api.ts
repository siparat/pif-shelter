import { listVolunteersResponseSchema } from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';

type ListVolunteersResponse = z.infer<typeof listVolunteersResponseSchema>;

export const getVolunteers = async (): Promise<ListVolunteersResponse['data']> => {
	const response = await api.get('admin/users/volunteers').json<ListVolunteersResponse>();
	return response.data;
};
