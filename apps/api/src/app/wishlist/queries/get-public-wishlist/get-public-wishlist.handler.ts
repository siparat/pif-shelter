import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { GetPublicWishlistDataDto } from '@pif/contracts';
import { DatabaseService } from '@pif/database';
import { WishlistCacheKeys, WishlistItemStatusEnum } from '@pif/shared';
import { GetPublicWishlistQuery } from './get-public-wishlist.query';

@QueryHandler(GetPublicWishlistQuery)
export class GetPublicWishlistHandler implements IQueryHandler<GetPublicWishlistQuery> {
	constructor(
		private readonly database: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute(): Promise<GetPublicWishlistDataDto> {
		const cached = await this.cache.get<GetPublicWishlistDataDto>(WishlistCacheKeys.PUBLIC).catch(() => null);
		if (cached) {
			return cached;
		}

		const rows = await this.database.client.query.wishlistCategories.findMany({
			orderBy: { sortOrder: 'asc' },
			with: {
				items: {
					orderBy: { sortOrder: 'asc' }
				}
			}
		});

		const categories = rows
			.map((category) => ({
				id: category.id,
				name: category.name,
				sortOrder: category.sortOrder,
				items: category.items
					.filter((item) => item.status !== WishlistItemStatusEnum.NOT_NEEDED)
					.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime())
					.map((item) => ({
						id: item.id,
						name: item.name,
						status: item.status,
						sortOrder: item.sortOrder
					}))
			}))
			.filter((category) => category.items.length > 0);

		const result: GetPublicWishlistDataDto = { categories };
		await this.cache.set(WishlistCacheKeys.PUBLIC, result).catch(() => undefined);
		return result;
	}
}
