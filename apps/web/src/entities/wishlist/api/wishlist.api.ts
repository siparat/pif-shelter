import { getPublicWishlistResponseSchema, type GetPublicWishlistData } from '@pif/contracts';
import { api } from '../../../shared/api/base';

export const getPublicWishlist = async (): Promise<GetPublicWishlistData> => {
	const body = await api.get('wishlist').json();
	return getPublicWishlistResponseSchema.parse(body).data;
};
