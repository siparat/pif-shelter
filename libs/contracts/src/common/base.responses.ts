import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject =>
	z.object({
		success: z.boolean().default(true).describe('Статус успешности запроса'),
		data: dataSchema
	});

export const createApiPaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T): z.ZodObject =>
	z.object({
		success: z.boolean().default(true).describe('Статус успешности запроса'),
		data: z.array(dataSchema),
		meta: z.object({
			total: z.number().describe('Всего записей'),
			page: z.number().describe('Текущая страница'),
			perPage: z.number().describe('Записей на странице'),
			totalPages: z.number().describe('Всего страниц')
		})
	});

export class ApiErrorResponseDto extends createZodDto(
	z.object({
		success: z.literal(false).default(false).describe('Статус неуспешности запроса'),
		error: z.object({
			code: z.string().describe('Машинночитаемый код ошибки (например, VALIDATION_ERROR)'),
			message: z.string().describe('Человекочитаемое сообщение об ошибке'),
			details: z
				.array(
					z.object({
						message: z.string().describe('Сообщение о конкретной ошибке в поле'),
						path: z.string().describe('Путь к полю, вызвавшему ошибку')
					})
				)
				.optional()
				.describe('Детализированный список ошибок (например, для валидации)')
		})
	})
) {}
