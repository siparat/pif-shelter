import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { DatabaseService } from '@pif/database';
import { WishlistCacheKeys } from '@pif/shared';
import { GetPublicWishlistData } from '../../../core/dto';
import { GetPublicWishlistQuery } from './get-public-wishlist.query';

@QueryHandler(GetPublicWishlistQuery)
export class GetPublicWishlistHandler implements IQueryHandler<GetPublicWishlistQuery> {
	constructor(
		private readonly database: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute(): Promise<GetPublicWishlistData> {
		const cached = await this.cache.get<GetPublicWishlistData>(WishlistCacheKeys.PUBLIC).catch(() => null);
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
				items: [...category.items]
					.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime())
					.map((item) => ({
						id: item.id,
						name: item.name,
						status: item.status,
						sortOrder: item.sortOrder
					}))
			}))
			.filter((category) => category.items.length > 0);

		const result: GetPublicWishlistData = { categories };
		await this.cache.set(WishlistCacheKeys.PUBLIC, result).catch(() => undefined);
		return result;
	}
}
