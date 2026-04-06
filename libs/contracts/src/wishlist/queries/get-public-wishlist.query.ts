import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { wishlistItemStatusSchema } from '../schemas/wishlist-item-status.schema';

export const publicWishlistItemSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	status: wishlistItemStatusSchema,
	sortOrder: z.number().int()
});

export const publicWishlistCategorySchema = z.object({
	id: z.uuid(),
	name: z.string(),
	sortOrder: z.number().int(),
	items: z.array(publicWishlistItemSchema)
});

export const getPublicWishlistResponseSchema = createApiSuccessResponseSchema(
	z.object({
		categories: z.array(publicWishlistCategorySchema)
	})
);

export class GetPublicWishlistResponseDto extends createZodDto(getPublicWishlistResponseSchema) {}

export type PublicWishlistCategoryDto = z.infer<typeof publicWishlistCategorySchema>;
export type GetPublicWishlistDataDto = z.infer<typeof getPublicWishlistResponseSchema>['data'];
