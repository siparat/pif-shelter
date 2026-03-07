import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { telegramNicknameSchema } from '../../common/schemas/telegram-nickname.schema';

export const startGuardianshipRequestSchema = z.object({
	animalId: z.uuid().describe('Уникальный идентификатор животного, для которого оформляется опека'),
	name: z
		.string('Укажите, как к вам обращаться')
		.trim()
		.min(1, 'Имя не может быть пустым')
		.max(255, 'Имя не может быть длиннее 255 символов')
		.describe('Имя опекуна'),
	email: z.email('Укажите корректный email для чеков и уведомлений').describe('Email опекуна'),
	telegramUsername: telegramNicknameSchema.describe('Telegram-ник опекуна для связи через бота')
});

export class StartGuardianshipRequestDto extends createZodDto(startGuardianshipRequestSchema) {}

export const startGuardianshipAuthenticatedRequestSchema = z.object({
	animalId: z.uuid().describe('Уникальный идентификатор животного, для которого оформляется опека')
});

export class StartGuardianshipAuthenticatedRequestDto extends createZodDto(
	startGuardianshipAuthenticatedRequestSchema
) {}

export const startGuardianshipResponseSchema = createApiSuccessResponseSchema(
	z.object({
		guardianshipId: z.uuid().describe('Уникальный идентификатор созданной записи опекунства'),
		paymentUrl: z.url().describe('Ссылка на платёжную страницу провайдера для оплаты первого месяца опекунства'),
		cancellationToken: z.string().describe('Токен отмены опекунства')
	})
);

export class StartGuardianshipResponseDto extends createZodDto(startGuardianshipResponseSchema) {}
