import { acceptInvitationResponseSchema } from '@pif/contracts';
import z from 'zod';
import { api } from '../../../../shared/api';

export interface AcceptInvitationPayload {
	token: string;
	fullName: string;
	telegram: string;
	password: string;
	avatarKey: string;
}

type AcceptInvitationResponse = z.infer<typeof acceptInvitationResponseSchema>;

export const acceptInvitation = async (payload: AcceptInvitationPayload): Promise<AcceptInvitationResponse['data']> => {
	const response = await api
		.post('admin/users/accept-invitation', { json: payload })
		.json<AcceptInvitationResponse>();
	return response.data;
};
