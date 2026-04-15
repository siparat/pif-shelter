import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const confirmMeetingRequestResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid(),
		status: z.literal('CONFIRMED')
	})
);
