import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const getGuardianshipByAnimalRequestSchema = z.object({
	animalId: z.uuid().describe('Уникальный идентификатор животного, для которого нужно получить опекунство')
});

export class GetGuardianshipByAnimalRequestDto extends createZodDto(getGuardianshipByAnimalRequestSchema) {}

const guardianshipViewResponseSchema = z
	.object({
		id: z.uuid(),
		animalId: z.uuid(),
		guardianUserId: z.string(),
		subscriptionId: z.string(),
		status: z.string(),
		animal: z.object({}).catchall(z.any()).nullable(),
		guardian: z.object({}).catchall(z.any()).nullable()
	})
	.catchall(z.any());

export const getGuardianshipByAnimalResponseSchema = createApiSuccessResponseSchema(
	guardianshipViewResponseSchema
		.extend({
			telegramBotLink: z
				.url()
				.optional()
				.describe('Ссылка на Telegram-бота для привязки (только при активном опекунстве)')
		})
		.describe('Текущая запись опекунства')
);

export class GetGuardianshipByAnimalResponseDto extends createZodDto(getGuardianshipByAnimalResponseSchema) {}
