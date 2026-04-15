import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { guardianshipViewSchema } from '../../common/schemas';

export const getGuardianshipByAnimalRequestSchema = z.object({
	animalId: z.uuid().describe('Уникальный идентификатор животного, для которого нужно получить опекунство')
});

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
