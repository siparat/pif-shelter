import { donationOneTimeIntents, donationSubscriptions } from '@pif/database';

export class DonationPaymentSucceededEvent {
	constructor(
		public readonly entity: typeof donationOneTimeIntents.$inferSelect | typeof donationSubscriptions.$inferSelect,
		public readonly providerPaymentId: string
	) {}
}
