import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const createMeetingRequestSchema = z.object({
	animalId: z.uuid('Некорректный идентификатор животного'),
	name: z.string().trim().min(2).max(120),
	phone: z
		.string()
		.trim()
		.min(6)
		.max(40)
		.transform((rawValue: string, ctx) => {
			try {
				const phoneNumber = parsePhoneNumberWithError(rawValue, 'RU');
				if (!phoneNumber.isValid()) {
					ctx.addIssue({
						code: 'custom',
						message: 'Invalid phone number'
					});
					return z.NEVER;
				}
				return phoneNumber.number;
			} catch {
				ctx.addIssue({
					code: 'custom',
					message: 'Invalid phone number format'
				});
				return z.NEVER;
			}
		}),
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
