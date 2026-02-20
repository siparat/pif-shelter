import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../../common/base.responses';

export const createInvitationRequestSchema = z.object({
	email: z.email('Почта указана неправильно'),
	roleName: z.string('Напишите роль человека в команде'),
	name: z.string('Введите имя приглашаемого человека')
});

export class CreateInvitationRequestDto extends createZodDto(createInvitationRequestSchema) {}

export const createInvitationResponseSchema = createApiSuccessResponseSchema(z.object({ invitationId: z.string() }));

export class CreateInvitationResponseDto extends createZodDto(createInvitationResponseSchema) {}
