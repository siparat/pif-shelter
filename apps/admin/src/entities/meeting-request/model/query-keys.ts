import { MeetingRequestsListParams } from './types';

export const meetingRequestsKeys = {
	all: ['meeting-requests'] as const,
	list: (params: MeetingRequestsListParams) => [...meetingRequestsKeys.all, 'list', params] as const,
	detail: (id: string) => [...meetingRequestsKeys.all, 'detail', id] as const
};
