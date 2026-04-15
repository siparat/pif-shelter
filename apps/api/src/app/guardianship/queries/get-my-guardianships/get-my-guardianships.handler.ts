import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { animals, DatabaseService, guardianshipPortalAccessWhere, guardianships } from '@pif/database';
import { GuardianshipCacheKeys } from '@pif/shared';
import { eq } from 'drizzle-orm';
import { GetMyGaurdianshipsResponseDto, ReturnData } from '../../../core/dto';
import { GetMyGaurdianshipsQuery } from './get-my-guardianships.query';

@QueryHandler(GetMyGaurdianshipsQuery)
export class GetMyGaurdianshipsHandler implements IQueryHandler<GetMyGaurdianshipsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ userId }: GetMyGaurdianshipsQuery): Promise<ReturnData<typeof GetMyGaurdianshipsResponseDto>> {
		const key = GuardianshipCacheKeys.activeByUserId(userId);
		const cached = await this.cache.get<ReturnData<typeof GetMyGaurdianshipsResponseDto>>(key).catch(() => null);
		if (cached) {
			return cached;
		}

		const now = new Date();
		const rows = await this.db.client
			.select({ g: guardianships, animal: animals })
			.from(guardianships)
			.innerJoin(animals, eq(guardianships.animalId, animals.id))
			.where(guardianshipPortalAccessWhere(now, { guardianUserId: userId }));

		const result = { guardianships: rows.map(({ g, animal }) => ({ ...g, animal })) };
		await this.cache.set(key, result).catch(() => undefined);

		return result;
	}
}
