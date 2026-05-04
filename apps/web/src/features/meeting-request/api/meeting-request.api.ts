import { createMeetingRequestSchema, createMeetingRequestResponseSchema } from '@pif/contracts';
import { api } from '../../../shared/api/base';

export type CreateMeetingRequestPayload = {
	animalId: string;
	name: string;
	phone: string;
	email?: string;
	comment?: string;
	meetingAt: string;
};

export const createMeetingRequest = async (payload: CreateMeetingRequestPayload): Promise<{ id: string }> => {
	const parsedPayload = createMeetingRequestSchema.parse(payload);
	const body = await api.post('meeting-requests', { json: parsedPayload }).json();
	return createMeetingRequestResponseSchema.parse(body).data;
};
