import {
	createWishlistCategoryResponseSchema,
	createWishlistItemResponseSchema,
	getWishlistManageResponseSchema,
	updateWishlistCategoryResponseSchema,
	updateWishlistItemResponseSchema
} from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';
import {
	CreateWishlistCategoryPayload,
	CreateWishlistCategoryResult as CreateWishlistCategoryResultData,
	CreateWishlistItemPayload,
	CreateWishlistItemResult as CreateWishlistItemResultData,
	UpdateWishlistCategoryPayload,
	UpdateWishlistCategoryResult as UpdateWishlistCategoryResultData,
	UpdateWishlistItemPayload,
	UpdateWishlistItemResult as UpdateWishlistItemResultData,
	WishlistManageData
} from '../model/types';

type GetWishlistManageResult = z.infer<typeof getWishlistManageResponseSchema>;
type CreateWishlistCategoryResult = z.infer<typeof createWishlistCategoryResponseSchema>;
type UpdateWishlistCategoryResult = z.infer<typeof updateWishlistCategoryResponseSchema>;
type CreateWishlistItemResult = z.infer<typeof createWishlistItemResponseSchema>;
type UpdateWishlistItemResult = z.infer<typeof updateWishlistItemResponseSchema>;

export const getWishlistManage = async (): Promise<WishlistManageData> => {
	const response = await api.get('wishlist/manage').json<GetWishlistManageResult>();
	return response.data;
};

export const createWishlistCategory = async (
	payload: CreateWishlistCategoryPayload
): Promise<CreateWishlistCategoryResultData> => {
	const response = await api.post('wishlist/categories', { json: payload }).json<CreateWishlistCategoryResult>();
	return response.data;
};

export const updateWishlistCategory = async (
	id: string,
	payload: UpdateWishlistCategoryPayload
): Promise<UpdateWishlistCategoryResultData> => {
	const response = await api
		.patch(`wishlist/categories/${id}`, { json: payload })
		.json<UpdateWishlistCategoryResult>();
	return response.data;
};

export const deleteWishlistCategory = async (id: string): Promise<void> => {
	await api.delete(`wishlist/categories/${id}`);
};

export const createWishlistItem = async (payload: CreateWishlistItemPayload): Promise<CreateWishlistItemResultData> => {
	const response = await api.post('wishlist/items', { json: payload }).json<CreateWishlistItemResult>();
	return response.data;
};

export const updateWishlistItem = async (
	id: string,
	payload: UpdateWishlistItemPayload
): Promise<UpdateWishlistItemResultData> => {
	const response = await api.patch(`wishlist/items/${id}`, { json: payload }).json<UpdateWishlistItemResult>();
	return response.data;
};

export const deleteWishlistItem = async (id: string): Promise<void> => {
	await api.delete(`wishlist/items/${id}`);
};
