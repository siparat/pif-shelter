import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { GetMyGaurdianshipsResponseDto, ReturnDto } from '@pif/contracts';
import { DatabaseService } from '@pif/database';
import { GuardianshipCacheKeys, GuardianshipStatusEnum } from '@pif/shared';
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

		const guardianships = await this.db.client.query.guardianships.findMany({
			where: { guardianUserId: userId, status: GuardianshipStatusEnum.ACTIVE },
			with: { animal: true }
		});

		const result = { guardianships };
		await this.cache.set(key, result).catch(() => undefined);

		return result;
	}
}
