import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common/base.responses';
import { paginationSchema } from '../../common/schemas/pagination.schema';
import { postResponseSchema } from './get-post.query';

export const listPostsRequestSchema = paginationSchema
	.extend({
		animalId: z.uuid('Некорректный идентификатор животного').describe('ID животного'),
		fromDate: z.optional(z.iso.date('Некорректная начальная дата')).describe('Дата начала периода'),
		toDate: z.optional(z.iso.date('Некорректная конечная дата')).describe('Дата окончания периода')
	})
	.refine((data) => (data.fromDate && data.toDate ? data.fromDate < data.toDate : true), {
		message: 'Начальная дата должна быть меньше конечной даты',
		path: ['fromDate']
	});

export const listPostsResponseSchema = createApiPaginatedResponseSchema(postResponseSchema);

export type ListPostsResult = Omit<z.infer<typeof listPostsResponseSchema>, 'success'>;
