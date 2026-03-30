import { campaigns } from '@pif/database';

export class CampaignCreatedEvent {
	constructor(public readonly campaign: typeof campaigns.$inferSelect) {}
}
