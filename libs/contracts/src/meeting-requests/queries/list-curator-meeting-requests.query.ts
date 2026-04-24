import { MeetingRequestStatusEnum } from '@pif/shared';
import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common/base.responses';
import { paginationSchema } from '../../common/schemas/pagination.schema';
import { meetingRequestResponseSchema } from './meeting-request-response.schema';

export const meetingRequestsSortSchema = z.enum(['createdAt:desc', 'createdAt:asc', 'meetingAt:asc', 'meetingAt:desc']);

export const listCuratorMeetingRequestsQuerySchema = paginationSchema.extend({
	status: z.enum(MeetingRequestStatusEnum).optional(),
	sort: meetingRequestsSortSchema.optional()
});

export const listCuratorMeetingRequestsResponseSchema = createApiPaginatedResponseSchema(meetingRequestResponseSchema);

export type ListCuratorMeetingRequestsResult = Omit<
	z.infer<typeof listCuratorMeetingRequestsResponseSchema>,
	'success'
>;
export type MeetingRequestsSort = z.infer<typeof meetingRequestsSortSchema>;
