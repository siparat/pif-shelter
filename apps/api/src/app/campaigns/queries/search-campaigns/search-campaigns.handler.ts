import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { animals, campaigns, DatabaseService, getSortOrder } from '@pif/database';
import { CampaignsCacheKeys } from '@pif/shared';
import { and, asc, desc, eq, getColumns, getOriginalColumnFromAlias, ilike, isNull, or, sql } from 'drizzle-orm';
import { CampaingsSearchResult, SearchCampaignsQuery } from './search-campaigns.query';

function hasColumn<T extends object>(columns: T, key: string): key is Extract<keyof T, string> {
	return key in columns;
}

@QueryHandler(SearchCampaignsQuery)
export class SearchCampaignsHandler implements IQueryHandler<SearchCampaignsQuery> {
	constructor(
		private readonly database: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto }: SearchCampaignsQuery): Promise<CampaingsSearchResult> {
		const cacheKey = this.cache.buildQueryKey(CampaignsCacheKeys.LIST, dto);
		const cachedResult = await this.cache.get<CampaingsSearchResult>(cacheKey).catch(() => null);
		if (cachedResult) {
			return cachedResult;
		}

		const { page, perPage, q, sort, status, animalId } = dto;
		const defaultSort = 'default';
		const searchTerm = q ? `%${q}%` : undefined;
		const { direction, column } = getSortOrder(sort, campaigns, { column: defaultSort, direction: 'desc' });
		const campaignColumns = getColumns(campaigns);
		const sortColumn = hasColumn(campaignColumns, column)
			? getOriginalColumnFromAlias(campaignColumns[column])
			: campaigns.createdAt;

		const campaignsList = await this.database.client
			.select({
				totalCount: sql<number>`(COUNT(*) OVER())::int`,
				...getColumns(campaigns),
				startsAt: sql<string>`${campaigns.startsAt}::varchar`,
				endsAt: sql<string>`${campaigns.endsAt}::varchar`,
				createdAt: sql<string>`${campaigns.createdAt}::varchar`,
				updatedAt: sql<string>`${campaigns.updatedAt}::varchar`,
				deletedAt: sql<string>`${campaigns.deletedAt}::varchar`,
				animal: {
					id: animals.id,
					name: animals.name,
					avatarUrl: animals.avatarUrl,
					gender: animals.gender,
					status: animals.status,
					species: animals.species
				}
			})
			.from(campaigns)
			.leftJoin(animals, eq(animals.id, campaigns.animalId))
			.where(
				and(
					animalId !== undefined ? eq(campaigns.animalId, animalId) : undefined,
					status && eq(campaigns.status, status),
					isNull(campaigns.deletedAt),
					searchTerm !== undefined
						? or(ilike(campaigns.title, searchTerm), ilike(animals.name, searchTerm))
						: undefined
				)
			)
			.limit(perPage)
			.offset(perPage * (page - 1))
			.orderBy(
				column == defaultSort
					? sql`CASE WHEN ${campaigns.endsAt} >= NOW() THEN 0 ELSE 1 END`
					: direction == 'asc'
						? asc(sortColumn)
						: desc(sortColumn),
				asc(campaigns.endsAt)
			);

		const total = campaignsList[0]?.totalCount || 0;
		const data = campaignsList.map(({ totalCount: _, ...campaign }) => campaign);

		const result = {
			data,
			meta: {
				page,
				perPage,
				total,
				totalPages: Math.ceil(total / perPage)
			}
		};
		this.cache.set(cacheKey, result).catch(() => null);

		return result;
	}
}
