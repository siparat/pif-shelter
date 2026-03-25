import { guardianshipViewSchema } from '@pif/database';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const getGuardianshipByAnimalRequestSchema = z.object({
	animalId: z.uuid().describe('Уникальный идентификатор животного, для которого нужно получить опекунство')
});

export class GetGuardianshipByAnimalRequestDto extends createZodDto(getGuardianshipByAnimalRequestSchema) {}

export const getGuardianshipByAnimalResponseSchema = createApiSuccessResponseSchema(
	guardianshipViewSchema
		.extend({
			telegramBotLink: z
				.url()
				.optional()
				.describe('Ссылка на Telegram-бота для привязки (только при активном опекунстве)')
		})
		.describe('Текущая запись опекунства')
);

export class GetGuardianshipByAnimalResponseDto extends createZodDto(getGuardianshipByAnimalResponseSchema) {}
