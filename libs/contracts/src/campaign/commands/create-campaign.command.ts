import { createZodDto } from 'nestjs-zod';
import sanitizeHtml from 'sanitize-html';
import z, { uuid } from 'zod';
import { createApiSuccessResponseSchema } from '../../common';

export const createCampaignRequestSchema = z.object({
	title: z
		.string('Укажите заголовок сбора')
		.trim()
		.min(1, { error: ({ minimum }) => `Минимальная длина заголовка – ${minimum}` })
		.max(36, { error: ({ maximum }) => `Максимальная длина заголовка – ${maximum}` })
		.describe('Заголовок сбора'),
	description: z
		.string('Описание обязательно')
		.trim()
		.min(250, { error: ({ minimum }) => `Минимальная длина описания – ${minimum}` })
		.max(10000, { error: ({ maximum }) => `Максимальная длина описания – ${maximum}` })
		.transform((html) => sanitizeHtml(html, { allowedTags: ['b', 'i', 'u', 's', 'code', 'pre'] }))
		.describe('Описание сбора в формате html'),
	goal: z
		.number()
		.int()
		.min(0, 'Невалидная цель сбора')
		.max(1000000000, 'Невалидная цель сбора')
		.describe('Цель сбора в копейках, 0 – сбор без ограничений'),
	previewImage: z.optional(z.string().trim().min(1).describe('Ключ объекта чека в S3')),
	animalId: z.optional(
		z.uuid('Невалидный id питомца').describe('Необязательный идентификатор питомца, привязывающий к срочному сбору')
	),
	startsAt: z.optional(z.iso.datetime().describe('Начало сбора, необязательно (будет время записи в бд)')),
	endsAt: z.iso.datetime().describe('Конец сбора')
});

export class CreateCampaignRequestDto extends createZodDto(createCampaignRequestSchema) {}

export const createCampaignResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: uuid()
	})
);

export class CreateCampaignResponseDto extends createZodDto(createCampaignResponseSchema) {}
