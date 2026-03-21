import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { GetMyGaurdianshipsResponseDto, ReturnDto } from '@pif/contracts';
import { animals, DatabaseService, guardianshipPortalAccessWhere, guardianships } from '@pif/database';
import { eq } from 'drizzle-orm';
import { GuardianshipCacheKeys } from '@pif/shared';
import { GetMyGaurdianshipsQuery } from './get-my-guardianships.query';

@QueryHandler(GetMyGaurdianshipsQuery)
export class GetMyGaurdianshipsHandler implements IQueryHandler<GetMyGaurdianshipsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ userId }: GetMyGaurdianshipsQuery): Promise<ReturnDto<typeof GetMyGaurdianshipsResponseDto>> {
		const key = GuardianshipCacheKeys.activeByUserId(userId);
		const cached = await this.cache.get<ReturnDto<typeof GetMyGaurdianshipsResponseDto>>(key).catch(() => null);
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
