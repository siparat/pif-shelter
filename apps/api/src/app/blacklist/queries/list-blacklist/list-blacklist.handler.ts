import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { ListBlacklistResult } from '@pif/contracts';
import { blacklist, DatabaseService } from '@pif/database';
import { BlacklistCacheKeys } from '@pif/shared';
import { and, asc, desc, eq, getColumns, ilike, sql } from 'drizzle-orm';
import { BlacklistEntryMapper } from '../../mappers/blacklist-entry.mapper';
import { ListBlacklistQuery } from './list-blacklist.query';

const SORT_FIELDS = ['addedAt', 'value', 'status', 'context', 'source'] as const;
type SortField = (typeof SORT_FIELDS)[number];

function parseSort(sort: string): { field: SortField; dir: 'asc' | 'desc' } {
	const [rawField, rawDir] = sort.split(':') as [string, string];
	const field = SORT_FIELDS.includes(rawField as SortField) ? (rawField as SortField) : 'addedAt';
	const dir = rawDir === 'asc' ? 'asc' : 'desc';
	return { field, dir };
}

@QueryHandler(ListBlacklistQuery)
export class ListBlacklistHandler implements IQueryHandler<ListBlacklistQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto }: ListBlacklistQuery): Promise<ListBlacklistResult> {
		const cacheKey = this.cache.buildQueryKey(BlacklistCacheKeys.LIST, dto);
		const cached = await this.cache.get<ListBlacklistResult>(cacheKey).catch(() => null);
		if (cached) {
			return cached;
		}

		const { page = 1, perPage = 20, q, sort, status, source } = dto;
		const { field, dir } = parseSort(sort);
		const searchTerm = q?.trim() ? `%${q.trim()}%` : undefined;

		const conditions = [];
		if (status !== undefined) {
			conditions.push(eq(blacklist.status, status));
		}
		if (source !== undefined) {
			conditions.push(eq(blacklist.source, source));
		}
		if (searchTerm) {
			conditions.push(ilike(blacklist.value, searchTerm));
		}
		const whereClause = conditions.length ? and(...conditions) : undefined;

		const sortColumn = blacklist[field];
		const orderBy = dir === 'asc' ? asc(sortColumn) : desc(sortColumn);

		const rows = await this.db.client
			.select({ totalCount: sql<number>`(COUNT(*) OVER())::int`, ...getColumns(blacklist) })
			.from(blacklist)
			.where(whereClause)
			.orderBy(orderBy)
			.limit(perPage)
			.offset((page - 1) * perPage);

		const total = rows[0]?.totalCount || 0;
		const result: ListBlacklistResult = {
			data: rows.map((row) => BlacklistEntryMapper.toEntry(row)),
			meta: {
				total,
				page,
				perPage,
				totalPages: Math.ceil(total / perPage) || 0
			}
		};
		await this.cache.set(cacheKey, result).catch(() => undefined);
		return result;
	}
}
