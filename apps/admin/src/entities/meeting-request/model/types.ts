import {
	confirmMeetingRequestResponseSchema,
	getMeetingRequestByIdResponseSchema,
	listCuratorMeetingRequestsQuerySchema,
	ListCuratorMeetingRequestsResult,
	meetingRequestResponseSchema,
	rejectMeetingRequestDtoSchema,
	rejectMeetingRequestResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type MeetingRequestsListParams = z.input<typeof listCuratorMeetingRequestsQuerySchema>;
export type MeetingRequestsListData = ListCuratorMeetingRequestsResult;
export type MeetingRequestItem = z.infer<typeof meetingRequestResponseSchema>;
export type MeetingRequestDetails = z.infer<typeof getMeetingRequestByIdResponseSchema>['data'];
export type RejectMeetingRequestPayload = z.input<typeof rejectMeetingRequestDtoSchema>;
export type ConfirmMeetingRequestData = z.infer<typeof confirmMeetingRequestResponseSchema>['data'];
export type RejectMeetingRequestData = z.infer<typeof rejectMeetingRequestResponseSchema>['data'];
