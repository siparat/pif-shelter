import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { meetingRequestResponseSchema } from './meeting-request-response.schema';

export const getMeetingRequestByIdResponseSchema = createApiSuccessResponseSchema(meetingRequestResponseSchema);
