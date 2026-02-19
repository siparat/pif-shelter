import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';
import { s3ImageKeySchema } from '../../../common/schemas/s3-image-key.schema';
import { telegramNicknameSchema } from '../../../common/schemas/telegram-nickname.schema';

export const acceptInvitationRequestSchema = z.object({
	avatarKey: s3ImageKeySchema,
	fullName: z.string('Укажите свое полное имя'),
	telegram: telegramNicknameSchema,
	token: z.uuid(),
	password: z
		.string('Введите пароль')
		.min(8, 'Пароль должен быть не менее 8 символов')
		.max(32)
		.regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
		.regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
		.regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
});

export class AcceptInvitationRequestDto extends createZodDto(acceptInvitationRequestSchema) {}

export const acceptInvitationResponseSchema = createApiSuccessResponseSchema(z.object({ userId: z.string() }));

export class AcceptInvitationResponseDto extends createZodDto(acceptInvitationResponseSchema) {}
