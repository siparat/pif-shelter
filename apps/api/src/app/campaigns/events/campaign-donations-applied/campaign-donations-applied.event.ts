import { campaigns } from '@pif/database';

export class CampaignDonationAppliedEvent {
	constructor(public readonly campaign: typeof campaigns.$inferSelect) {}
}
