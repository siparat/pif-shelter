import { donationOneTimeIntents, donationSubscriptions } from '@pif/database';
import { DonationOneTimeIntentStatusEnum, DonationSubscriptionStatusEnum } from '@pif/shared';

export type CreateDonationOneTimeIntentPayload = {
	transactionId: string;
	displayName: string;
	hidePublicName: boolean;
	expectedAmount: number;
};

export type CreateDonationSubscriptionPayload = {
	subscriptionId: string;
	displayName: string;
	hidePublicName: boolean;
	amountPerPeriod: number;
};

export abstract class DonationIntentsRepository {
	abstract createOneTimePending(
		payload: CreateDonationOneTimeIntentPayload
	): Promise<typeof donationOneTimeIntents.$inferSelect>;

	abstract findOneTimeByTransactionId(
		transactionId: string
	): Promise<typeof donationOneTimeIntents.$inferSelect | undefined>;

	abstract findOneTimeByProviderPaymentId(
		providerPaymentId: string
	): Promise<typeof donationOneTimeIntents.$inferSelect | undefined>;

	abstract updateOneTimeStatus(
		id: string,
		status: DonationOneTimeIntentStatusEnum,
		providerPaymentId?: string
	): Promise<typeof donationOneTimeIntents.$inferSelect | undefined>;

	abstract createSubscriptionPending(
		payload: CreateDonationSubscriptionPayload
	): Promise<typeof donationSubscriptions.$inferSelect>;

	abstract findSubscriptionBySubscriptionId(
		subscriptionId: string
	): Promise<typeof donationSubscriptions.$inferSelect | undefined>;

	abstract findSubscriptionByCancellationToken(
		token: string
	): Promise<typeof donationSubscriptions.$inferSelect | undefined>;

	abstract updateSubscriptionStatus(
		id: string,
		status: DonationSubscriptionStatusEnum
	): Promise<typeof donationSubscriptions.$inferSelect | undefined>;

	abstract setSubscriptionCancellationToken(
		id: string,
		token: string
	): Promise<typeof donationSubscriptions.$inferSelect | undefined>;

	abstract clearSubscriptionCancellationToken(
		id: string
	): Promise<typeof donationSubscriptions.$inferSelect | undefined>;

	abstract markSubscriptionCancelled(
		id: string,
		cancelledAt: Date
	): Promise<typeof donationSubscriptions.$inferSelect | undefined>;
}
