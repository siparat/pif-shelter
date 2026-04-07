import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const rejectMeetingRequestDtoSchema = z.object({
	reason: z.string().trim().min(1).max(300)
});

export class RejectMeetingRequestDto extends createZodDto(rejectMeetingRequestDtoSchema) {}

export const rejectMeetingRequestResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid(),
		status: z.literal('REJECTED')
	})
);

export class RejectMeetingRequestResponseDto extends createZodDto(rejectMeetingRequestResponseSchema) {}
