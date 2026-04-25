import { CreateInvitationResponse } from '@pif/contracts';
import { api } from '../../../shared/api';

export interface CreateInvitationPayload {
	name: string;
	email: string;
	roleName: string;
}

export const createInvitation = async (payload: CreateInvitationPayload): Promise<CreateInvitationResponse['data']> => {
	const response = await api.post('admin/users/invite', { json: payload }).json<CreateInvitationResponse>();
	return response.data;
};
