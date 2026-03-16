import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { ListPostsResult } from '@pif/contracts';
import { DatabaseService, getSortOrder, posts } from '@pif/database';
import { PostCacheKeys, PostVisibilityEnum, STAFF_ROLES } from '@pif/shared';
import { and, count, eq } from 'drizzle-orm';
import { PostMapper, PostResponseDto } from '../../mappers/post.mapper';
import { ListPostsBuilder } from './list-posts.builder';
import { ListPostsQuery } from './list-posts.query';

@QueryHandler(ListPostsQuery)
export class ListPostsHandler implements IQueryHandler<ListPostsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto, userId, userRole }: ListPostsQuery): Promise<ListPostsResult> {
		const cacheKey = this.cache.buildQueryKey(PostCacheKeys.LIST, { ...dto, userId, userRole });
		const cached = await this.cache.get<ListPostsResult>(cacheKey).catch(() => null);
		if (cached) {
			return cached;
		}

		const isStaff = userRole && STAFF_ROLES.includes(userRole);

		const { page = 1, perPage = 20, q, sort, fromDate, toDate } = dto;
		const { sql: baseSql, orm: baseOrm } = new ListPostsBuilder(posts as typeof posts & Record<string, unknown>)
			.setSearchTerm(q)
			.setAnimalId(dto.animalId)
			.setPostDateRange(fromDate, toDate)
			.build();

		if (!isStaff) {
			baseOrm.AND?.push({ visibility: PostVisibilityEnum.PUBLIC });
			baseSql.push(eq(posts.visibility, PostVisibilityEnum.PUBLIC));
		}

		const orderBy = getSortOrder(sort, posts, { column: 'createdAt', direction: 'desc' });

		const [rows, [totalResult]] = await Promise.all([
			this.db.client.query.posts.findMany({
				where: baseOrm as object,
				limit: perPage,
				offset: perPage * (page - 1),
				orderBy: { [orderBy.column]: orderBy.direction },
				with: { media: { orderBy: { order: 'asc' } } }
			}),
			this.db.client
				.select({ count: count() })
				.from(posts)
				.where(and(...baseSql))
		]);

		const data = rows.map((row) => PostMapper.toResponse(row));
		const total = totalResult.count;
		const result = this.buildResult(data, total, page, perPage);
		await this.cache.set(cacheKey, result).catch(() => undefined);
		return result;
	}

	private buildResult(data: PostResponseDto[], total: number, page: number, perPage: number): ListPostsResult {
		return {
			data,
			meta: {
				total,
				page,
				perPage,
				totalPages: Math.ceil(total / perPage)
			}
		};
	}
}
