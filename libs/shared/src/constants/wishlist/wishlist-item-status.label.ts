import { WishlistItemStatusEnum } from './wishlist-item-status.enum';

export const WISHLIST_ITEM_STATUS_LABEL: Record<WishlistItemStatusEnum, string> = {
	[WishlistItemStatusEnum.ALWAYS_NEEDED]: 'Постоянно нужно',
	[WishlistItemStatusEnum.SOS]: 'Срочно (SOS)',
	[WishlistItemStatusEnum.NOT_NEEDED]: 'Не требуется'
};
