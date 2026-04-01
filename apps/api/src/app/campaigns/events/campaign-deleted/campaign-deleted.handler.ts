import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { CampaignsCacheKeys } from '@pif/shared';
import { CampaignDeletedEvent } from './campaign-deleted.event';

@EventsHandler(CampaignDeletedEvent)
export class CampaignDeletedHandler implements IEventHandler<CampaignDeletedEvent> {
	constructor(private readonly cache: CacheService) {}

	async handle({ campaignId }: CampaignDeletedEvent): Promise<void> {
		await Promise.all([
			this.cache.del(CampaignsCacheKeys.detail(campaignId)),
			this.cache.delByPattern(`${CampaignsCacheKeys.LIST}:*`)
		]);
	}
}
