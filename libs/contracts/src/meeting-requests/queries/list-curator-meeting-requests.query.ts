import { MeetingRequestStatusEnum } from '@pif/shared';
import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common/base.responses';
import { paginationSchema } from '../../common/schemas/pagination.schema';
import { meetingRequestResponseSchema } from './meeting-request-response.schema';

export const listCuratorMeetingRequestsQuerySchema = paginationSchema.extend({
	status: z.enum(MeetingRequestStatusEnum).optional()
});

export const listCuratorMeetingRequestsResponseSchema = createApiPaginatedResponseSchema(meetingRequestResponseSchema);

export type ListCuratorMeetingRequestsResult = Omit<
	z.infer<typeof listCuratorMeetingRequestsResponseSchema>,
	'success'
>;
