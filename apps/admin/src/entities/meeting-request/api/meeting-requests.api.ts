import {
	ListCuratorMeetingRequestsResult,
	confirmMeetingRequestResponseSchema,
	getMeetingRequestByIdResponseSchema,
	rejectMeetingRequestResponseSchema
} from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';
import {
	ConfirmMeetingRequestData,
	MeetingRequestDetails,
	MeetingRequestsListData,
	MeetingRequestsListParams,
	RejectMeetingRequestData,
	RejectMeetingRequestPayload
} from '../model/types';

type GetMeetingRequestByIdResult = z.infer<typeof getMeetingRequestByIdResponseSchema>;
type ConfirmMeetingRequestResult = z.infer<typeof confirmMeetingRequestResponseSchema>;
type RejectMeetingRequestResult = z.infer<typeof rejectMeetingRequestResponseSchema>;

const buildSearchParams = (params: MeetingRequestsListParams): Record<string, string> => {
	const rawEntries = Object.entries(params).filter(
		([, value]) => value !== undefined && value !== null && value !== ''
	);
	return Object.fromEntries(rawEntries.map(([key, value]) => [key, String(value)]));
};

export const getCuratorMeetingRequests = async (
	params: MeetingRequestsListParams
): Promise<MeetingRequestsListData> => {
	const response = await api
		.get('meeting-requests/curator', { searchParams: buildSearchParams(params) })
		.json<ListCuratorMeetingRequestsResult>();
	return response;
};

export const getMeetingRequestById = async (id: string): Promise<MeetingRequestDetails> => {
	const response = await api.get(`meeting-requests/${id}`).json<GetMeetingRequestByIdResult>();
	return response.data;
};

export const confirmMeetingRequest = async (id: string): Promise<ConfirmMeetingRequestData> => {
	const response = await api.patch(`meeting-requests/${id}/confirm`).json<ConfirmMeetingRequestResult>();
	return response.data;
};

export const rejectMeetingRequest = async (
	id: string,
	payload: RejectMeetingRequestPayload
): Promise<RejectMeetingRequestData> => {
	const response = await api
		.patch(`meeting-requests/${id}/reject`, { json: payload })
		.json<RejectMeetingRequestResult>();
	return response.data;
};
