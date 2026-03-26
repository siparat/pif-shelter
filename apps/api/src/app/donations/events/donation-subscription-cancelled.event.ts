import { donationSubscriptions } from '@pif/database';

export class DonationSubscriptionCancelledEvent {
	constructor(public readonly subscription: typeof donationSubscriptions.$inferSelect) {}
}
