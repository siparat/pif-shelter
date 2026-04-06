import { Injectable } from '@nestjs/common';
import {
	CreateWishlistCategoryRequestDto,
	CreateWishlistItemRequestDto,
	UpdateWishlistCategoryRequestDto,
	UpdateWishlistItemRequestDto
} from '@pif/contracts';
import { DatabaseService, wishlistCategories, wishlistItems } from '@pif/database';
import { WishlistItemStatusEnum } from '@pif/shared';
import { eq } from 'drizzle-orm';
import { WishlistRepository } from './wishlist.repository';

@Injectable()
export class DrizzleWishlistRepository extends WishlistRepository {
	constructor(private readonly database: DatabaseService) {
		super();
	}

	async createCategory(dto: CreateWishlistCategoryRequestDto): Promise<string> {
		const [row] = await this.database.client
			.insert(wishlistCategories)
			.values({
				name: dto.name,
				sortOrder: dto.sortOrder ?? 0
			})
			.returning({ id: wishlistCategories.id });
		return row.id;
	}

	async updateCategory(id: string, dto: UpdateWishlistCategoryRequestDto): Promise<boolean> {
		const patch: Partial<typeof wishlistCategories.$inferInsert> = {};
		if (dto.name !== undefined) {
			patch.name = dto.name;
		}
		if (dto.sortOrder !== undefined) {
			patch.sortOrder = dto.sortOrder;
		}
		if (Object.keys(patch).length === 0) {
			const existing = await this.findCategoryById(id);
			return existing !== undefined;
		}
		const [row] = await this.database.client
			.update(wishlistCategories)
			.set(patch)
			.where(eq(wishlistCategories.id, id))
			.returning({ id: wishlistCategories.id });
		return row !== undefined;
	}

	async deleteCategory(id: string): Promise<boolean> {
		const rows = await this.database.client
			.delete(wishlistCategories)
			.where(eq(wishlistCategories.id, id))
			.returning({ id: wishlistCategories.id });
		return rows.length > 0;
	}

	async findCategoryById(id: string): Promise<typeof wishlistCategories.$inferSelect | undefined> {
		return this.database.client.query.wishlistCategories.findFirst({
			where: { id }
		});
	}

	async createItem(dto: CreateWishlistItemRequestDto): Promise<string> {
		const [row] = await this.database.client
			.insert(wishlistItems)
			.values({
				categoryId: dto.categoryId,
				name: dto.name,
				status: dto.status ?? WishlistItemStatusEnum.ALWAYS_NEEDED,
				sortOrder: dto.sortOrder ?? 0
			})
			.returning({ id: wishlistItems.id });
		return row.id;
	}

	async updateItem(id: string, dto: UpdateWishlistItemRequestDto): Promise<boolean> {
		const patch: Partial<typeof wishlistItems.$inferInsert> = {};
		if (dto.categoryId !== undefined) {
			patch.categoryId = dto.categoryId;
		}
		if (dto.name !== undefined) {
			patch.name = dto.name;
		}
		if (dto.status !== undefined) {
			patch.status = dto.status;
		}
		if (dto.sortOrder !== undefined) {
			patch.sortOrder = dto.sortOrder;
		}
		if (Object.keys(patch).length === 0) {
			const existing = await this.findItemById(id);
			return existing !== undefined;
		}
		const [row] = await this.database.client
			.update(wishlistItems)
			.set(patch)
			.where(eq(wishlistItems.id, id))
			.returning({ id: wishlistItems.id });
		return row !== undefined;
	}

	async deleteItem(id: string): Promise<boolean> {
		const rows = await this.database.client
			.delete(wishlistItems)
			.where(eq(wishlistItems.id, id))
			.returning({ id: wishlistItems.id });
		return rows.length > 0;
	}

	async findItemById(id: string): Promise<typeof wishlistItems.$inferSelect | undefined> {
		return this.database.client.query.wishlistItems.findFirst({
			where: { id }
		});
	}
}
