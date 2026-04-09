import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { phoneSchema } from '../../common';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const createMeetingRequestSchema = z.object({
	animalId: z.uuid('Некорректный идентификатор животного'),
	name: z.string().trim().min(2).max(120),
	phone: phoneSchema,
	email: z.email().trim().optional(),
	comment: z.string().trim().max(1000).optional(),
	meetingAt: z.iso.datetime('Некорректная дата встречи')
});

export class CreateMeetingRequestDto extends createZodDto(createMeetingRequestSchema) {}

export const createMeetingRequestResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);

export class CreateMeetingRequestResponseDto extends createZodDto(createMeetingRequestResponseSchema) {}
