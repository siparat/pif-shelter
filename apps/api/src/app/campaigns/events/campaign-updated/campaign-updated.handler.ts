import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { CampaignsCacheKeys } from '@pif/shared';
import { CampaignUpdatedEvent } from './campaign-updated.event';

@EventsHandler(CampaignUpdatedEvent)
export class CampaignUpdatedHandler implements IEventHandler<CampaignUpdatedEvent> {
	constructor(private readonly cache: CacheService) {}

	async handle({ campaign: { id } }: CampaignUpdatedEvent): Promise<void> {
		await Promise.all([
			this.cache.del(CampaignsCacheKeys.detail(id)),
			this.cache.delByPattern(`${CampaignsCacheKeys.LIST}:*`)
		]);
	}
}
