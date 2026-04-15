import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { GetWishlistManageData } from '../../../core/dto';
import { GetWishlistManageQuery } from './get-wishlist-manage.query';

@QueryHandler(GetWishlistManageQuery)
export class GetWishlistManageHandler implements IQueryHandler<GetWishlistManageQuery> {
	constructor(private readonly database: DatabaseService) {}

	async execute(): Promise<GetWishlistManageData> {
		const rows = await this.database.client.query.wishlistCategories.findMany({
			orderBy: { sortOrder: 'asc' },
			with: {
				items: {
					orderBy: { sortOrder: 'asc' }
				}
			}
		});

		return {
			categories: rows.map((category) => ({
				id: category.id,
				name: category.name,
				sortOrder: category.sortOrder,
				createdAt: category.createdAt.toISOString(),
				updatedAt: category.updatedAt?.toISOString() ?? null,
				items: category.items
					.sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime())
					.map((item) => ({
						id: item.id,
						categoryId: item.categoryId,
						name: item.name,
						status: item.status,
						sortOrder: item.sortOrder,
						createdAt: item.createdAt.toISOString(),
						updatedAt: item.updatedAt?.toISOString() ?? null
					}))
			}))
		};
	}
}
