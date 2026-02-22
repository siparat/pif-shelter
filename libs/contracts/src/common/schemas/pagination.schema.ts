import { z } from 'zod';

export const paginationSchema = z.object({
	page: z.coerce.number().min(1).default(1).describe('Номер страницы (начинается с 1)'),
	perPage: z.coerce.number().min(1).max(100).default(20).describe('Количество элементов на странице'),
	q: z.string().trim().optional().describe('Поисковый запрос (full-text search)'),
	sort: z
		.string()
		.trim()
		.regex(/^[a-zA-Z0-9_]+:(asc|desc)$/, 'Формат сортировки: field:asc или field:desc')
		.default('createdAt:desc')
		.describe('Сортировка (например, createdAt:desc)')
});

export type PaginationDto = z.infer<typeof paginationSchema>;
