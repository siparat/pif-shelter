import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { CampaignsCacheKeys } from '@pif/shared';
import { CampaignCreatedEvent } from './campaign-created.event';

@EventsHandler(CampaignCreatedEvent)
export class CampaignCreatedHandler implements IEventHandler<CampaignCreatedEvent> {
	constructor(private readonly cache: CacheService) {}

	async handle({ campaign: { id } }: CampaignCreatedEvent): Promise<void> {
		await this.cache.del(CampaignsCacheKeys.detail(id));
	}
}
