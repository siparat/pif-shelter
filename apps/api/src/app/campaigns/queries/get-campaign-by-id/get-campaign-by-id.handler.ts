import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { DatabaseService } from '@pif/database';
import { CampaignsCacheKeys } from '@pif/shared';
import { CampaignNotFoundException } from '../../exceptions/campaign-not-found.exception';
import { CampaignDetails, GetCampaignByIdQuery } from './get-campaign-by-id.query';

@QueryHandler(GetCampaignByIdQuery)
export class GetCampaignByIdHandler implements IQueryHandler<GetCampaignByIdQuery> {
	constructor(
		private readonly database: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ id }: GetCampaignByIdQuery): Promise<CampaignDetails> {
		const cacheKey = CampaignsCacheKeys.detail(id);
		const cachedResult = await this.cache.get<CampaignDetails>(cacheKey).catch(() => null);

		if (cachedResult) {
			return cachedResult;
		}

		const result = await this.database.client.query.campaigns.findFirst({
			where: { id, deletedAt: { isNull: true } },
			with: {
				animal: {
					columns: { id: true, name: true, avatarUrl: true, gender: true, status: true, species: true }
				}
			}
		});

		if (!result) {
			throw new CampaignNotFoundException();
		}

		await this.cache.set(cacheKey, result).catch(() => null);

		return result;
	}
}
