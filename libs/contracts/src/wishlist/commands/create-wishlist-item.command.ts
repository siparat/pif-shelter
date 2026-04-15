import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { wishlistItemStatusSchema } from '../schemas/wishlist-item-status.schema';

export const createWishlistItemRequestSchema = z.object({
	categoryId: z.uuid().describe('Идентификатор категории'),
	name: z.string().trim().min(1).max(300).describe('Название позиции'),
	status: wishlistItemStatusSchema.optional().describe('Статус потребности'),
	sortOrder: z.number().int().optional().describe('Порядок сортировки в категории')
});

export const createWishlistItemResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid().describe('Идентификатор позиции')
	})
);
