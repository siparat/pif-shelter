import { donationOneTimeIntents } from '@pif/database';

export class DonationOneTimeInitiatedEvent {
	constructor(public readonly intent: typeof donationOneTimeIntents.$inferSelect) {}
}
