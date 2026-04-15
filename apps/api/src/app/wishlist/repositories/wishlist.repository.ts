import { wishlistCategories, wishlistItems } from '@pif/database';
import {
	CreateWishlistCategoryRequestDto,
	CreateWishlistItemRequestDto,
	UpdateWishlistCategoryRequestDto,
	UpdateWishlistItemRequestDto
} from '../../core/dto';

export abstract class WishlistRepository {
	abstract createCategory(dto: CreateWishlistCategoryRequestDto): Promise<string>;
	abstract updateCategory(id: string, dto: UpdateWishlistCategoryRequestDto): Promise<boolean>;
	abstract deleteCategory(id: string): Promise<boolean>;
	abstract findCategoryById(id: string): Promise<typeof wishlistCategories.$inferSelect | undefined>;

	abstract createItem(dto: CreateWishlistItemRequestDto): Promise<string>;
	abstract updateItem(id: string, dto: UpdateWishlistItemRequestDto): Promise<boolean>;
	abstract deleteItem(id: string): Promise<boolean>;
	abstract findItemById(id: string): Promise<typeof wishlistItems.$inferSelect | undefined>;
}
