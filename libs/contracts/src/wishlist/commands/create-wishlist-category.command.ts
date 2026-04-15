import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

export const createWishlistCategoryRequestSchema = z.object({
	name: z.string().trim().min(1).max(200).describe('Название категории'),
	sortOrder: z.number().int().optional().describe('Порядок сортировки')
});

export const createWishlistCategoryResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор категории')
	})
);
