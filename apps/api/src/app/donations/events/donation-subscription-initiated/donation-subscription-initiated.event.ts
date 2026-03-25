import { donationSubscriptions } from '@pif/database';

export class DonationSubscriptionInitiatedEvent {
	constructor(
		public readonly subscription: typeof donationSubscriptions.$inferSelect,
		public readonly email: string
	) {}
}
