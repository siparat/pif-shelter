import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { CampaignsCacheKeys } from '@pif/shared';
import { CampaignDonationAppliedEvent } from './campaign-donations-applied.event';

@EventsHandler(CampaignDonationAppliedEvent)
export class CampaignDonationAppliedHandler implements IEventHandler<CampaignDonationAppliedEvent> {
	constructor(private readonly cache: CacheService) {}

	async handle({ campaign: { id } }: CampaignDonationAppliedEvent): Promise<void> {
		await Promise.all([
			this.cache.del(CampaignsCacheKeys.detail(id)),
			this.cache.delByPattern(`${CampaignsCacheKeys.LIST}:*`)
		]);
	}
}
