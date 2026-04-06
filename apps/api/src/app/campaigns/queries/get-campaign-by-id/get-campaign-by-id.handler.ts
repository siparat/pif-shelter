import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { DatabaseService } from '@pif/database';
import { CampaignsCacheKeys, CampaignStatus } from '@pif/shared';
import { CampaignNotFoundException } from '../../exceptions/campaign-not-found.exception';
import { CampaignsService } from '../../campaigns.service';
import { CampaignDetails, GetCampaignByIdQuery } from './get-campaign-by-id.query';

@QueryHandler(GetCampaignByIdQuery)
export class GetCampaignByIdHandler implements IQueryHandler<GetCampaignByIdQuery> {
	constructor(
		private readonly database: DatabaseService,
		private readonly cache: CacheService,
		private readonly campaignsService: CampaignsService
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
		const now = new Date();
		if (await this.campaignsService.expirePublishedIfDue(result.id, now)) {
			result.status = CampaignStatus.FAILED;
		}

		await this.cache.set(cacheKey, result).catch(() => null);

		return result;
	}
}
