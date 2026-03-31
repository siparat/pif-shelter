import { campaigns } from '@pif/database';

export class CampaignUpdatedEvent {
	constructor(public readonly campaign: typeof campaigns.$inferSelect) {}
}
