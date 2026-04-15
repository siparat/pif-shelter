import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { wishlistItemStatusSchema } from '../schemas/wishlist-item-status.schema';

export const manageWishlistItemSchema = z.object({
	id: z.uuid(),
	categoryId: z.uuid(),
	name: z.string(),
	status: wishlistItemStatusSchema,
	sortOrder: z.number().int(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullish()
});

export const manageWishlistCategorySchema = z.object({
	id: z.uuid(),
	name: z.string(),
	sortOrder: z.number().int(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullish(),
	items: z.array(manageWishlistItemSchema)
});

export const getWishlistManageResponseSchema = createApiSuccessResponseSchema(
	z.object({
		categories: z.array(manageWishlistCategorySchema)
	})
);

export type GetWishlistManageData = z.infer<typeof getWishlistManageResponseSchema>['data'];
