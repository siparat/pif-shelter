import {
	createWishlistCategoryRequestSchema,
	createWishlistCategoryResponseSchema,
	createWishlistItemRequestSchema,
	createWishlistItemResponseSchema,
	getWishlistManageResponseSchema,
	updateWishlistCategoryRequestSchema,
	updateWishlistCategoryResponseSchema,
	updateWishlistItemRequestSchema,
	updateWishlistItemResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type WishlistManageData = z.infer<typeof getWishlistManageResponseSchema>['data'];
export type WishlistManageCategory = WishlistManageData['categories'][number];
export type WishlistManageItem = WishlistManageCategory['items'][number];

export type CreateWishlistCategoryPayload = z.input<typeof createWishlistCategoryRequestSchema>;
export type CreateWishlistCategoryResult = z.infer<typeof createWishlistCategoryResponseSchema>['data'];

export type UpdateWishlistCategoryPayload = z.input<typeof updateWishlistCategoryRequestSchema>;
export type UpdateWishlistCategoryResult = z.infer<typeof updateWishlistCategoryResponseSchema>['data'];

export type CreateWishlistItemPayload = z.input<typeof createWishlistItemRequestSchema>;
export type CreateWishlistItemResult = z.infer<typeof createWishlistItemResponseSchema>['data'];

export type UpdateWishlistItemPayload = z.input<typeof updateWishlistItemRequestSchema>;
export type UpdateWishlistItemResult = z.infer<typeof updateWishlistItemResponseSchema>['data'];
