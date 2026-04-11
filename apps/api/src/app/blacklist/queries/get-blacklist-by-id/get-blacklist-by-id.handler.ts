import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { GetBlacklistByIdResponseDto, ReturnDto } from '@pif/contracts';
import { blacklist, DatabaseService } from '@pif/database';
import { BlacklistCacheKeys } from '@pif/shared';
import { eq } from 'drizzle-orm';
import { BlacklistEntryNotFoundException } from '../../exceptions/blacklist-entry-not-found.exception';
import { BlacklistEntryMapper } from '../../mappers/blacklist-entry.mapper';
import { GetBlacklistByIdQuery } from './get-blacklist-by-id.query';

@QueryHandler(GetBlacklistByIdQuery)
export class GetBlacklistByIdHandler implements IQueryHandler<GetBlacklistByIdQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ id }: GetBlacklistByIdQuery): Promise<ReturnDto<typeof GetBlacklistByIdResponseDto>> {
		const cacheKey = BlacklistCacheKeys.detail(id);
		const cached = await this.cache.get<ReturnDto<typeof GetBlacklistByIdResponseDto>>(cacheKey).catch(() => null);
		if (cached) {
			return cached;
		}

		const [row] = await this.db.client.select().from(blacklist).where(eq(blacklist.id, id)).limit(1);
		if (!row) {
			throw new BlacklistEntryNotFoundException(id);
		}

		const data = BlacklistEntryMapper.toEntry(row);
		await this.cache.set(cacheKey, data).catch(() => undefined);
		return data;
	}
}
