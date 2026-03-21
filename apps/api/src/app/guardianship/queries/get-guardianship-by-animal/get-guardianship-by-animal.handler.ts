import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { animals, DatabaseService, guardianships, users } from '@pif/database';
import { GuardianshipCacheKeys, GuardianshipStatusEnum } from '@pif/shared';
import { GuardianshipNotFoundException } from '../../exceptions/guardianship-not-found.exception';
import { GetGuardianshipByAnimalQuery } from './get-guardianship-by-animal.query';

@QueryHandler(GetGuardianshipByAnimalQuery)
export class GetGuardianshipByAnimalHandler implements IQueryHandler<GetGuardianshipByAnimalQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute(query: GetGuardianshipByAnimalQuery): Promise<
		typeof guardianships.$inferSelect & {
			guardian: typeof users.$inferSelect | null;
			animal: typeof animals.$inferSelect | null;
		}
	> {
		const key = GuardianshipCacheKeys.byAnimal(query.animalId);
		const cached = await this.cache
			.get<ReturnType<GetGuardianshipByAnimalHandler['execute']>>(key)
			.catch(() => null);
		if (cached) {
			return cached;
		}

		const result = await this.db.client.query.guardianships.findFirst({
			where: { animalId: query.animalId, status: GuardianshipStatusEnum.ACTIVE },
			with: { guardian: true, animal: true }
		});

		if (!result || result.guardian == null || result.animal == null) {
			throw new GuardianshipNotFoundException();
		}

		await this.cache.set(key, result).catch(() => undefined);
		return result;
	}
}
