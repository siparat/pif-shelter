import { Injectable } from '@nestjs/common';
import { DatabaseService, donationOneTimeIntents, donationSubscriptions } from '@pif/database';
import { DonationOneTimeIntentStatusEnum, DonationSubscriptionStatusEnum } from '@pif/shared';
import { and, eq } from 'drizzle-orm';
import {
	CreateDonationOneTimeIntentPayload,
	CreateDonationSubscriptionPayload,
	DonationIntentsRepository
} from './donation-intents.repository';

@Injectable()
export class DrizzleDonationIntentsRepository implements DonationIntentsRepository {
	constructor(private readonly db: DatabaseService) {}

	async createOneTimePending(
		payload: CreateDonationOneTimeIntentPayload
	): Promise<typeof donationOneTimeIntents.$inferSelect> {
		const [created] = await this.db.client
			.insert(donationOneTimeIntents)
			.values({
				transactionId: payload.transactionId,
				displayName: payload.displayName,
				hidePublicName: payload.hidePublicName,
				expectedAmount: payload.expectedAmount,
				campaignId: payload.campaignId,
				status: DonationOneTimeIntentStatusEnum.PENDING
			})
			.returning();
		return created;
	}

	findOneTimeByTransactionId(transactionId: string): Promise<typeof donationOneTimeIntents.$inferSelect | undefined> {
		return this.db.client.query.donationOneTimeIntents.findFirst({ where: { transactionId } });
	}

	findOneTimeByProviderPaymentId(
		providerPaymentId: string
	): Promise<typeof donationOneTimeIntents.$inferSelect | undefined> {
		return this.db.client.query.donationOneTimeIntents.findFirst({ where: { providerPaymentId } });
	}

	async updateOneTimeStatus(
		id: string,
		status: DonationOneTimeIntentStatusEnum,
		providerPaymentId?: string
	): Promise<typeof donationOneTimeIntents.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(donationOneTimeIntents)
			.set({
				status,
				providerPaymentId
			})
			.where(eq(donationOneTimeIntents.id, id))
			.returning();
		return updated;
	}

	async createSubscriptionPending(
		payload: CreateDonationSubscriptionPayload
	): Promise<typeof donationSubscriptions.$inferSelect> {
		const [created] = await this.db.client
			.insert(donationSubscriptions)
			.values({
				subscriptionId: payload.subscriptionId,
				displayName: payload.displayName,
				hidePublicName: payload.hidePublicName,
				amountPerPeriod: payload.amountPerPeriod,
				status: DonationSubscriptionStatusEnum.PENDING_FIRST_PAYMENT
			})
			.returning();
		return created;
	}

	findSubscriptionBySubscriptionId(
		subscriptionId: string
	): Promise<typeof donationSubscriptions.$inferSelect | undefined> {
		return this.db.client.query.donationSubscriptions.findFirst({ where: { subscriptionId } });
	}

	findSubscriptionByCancellationToken(token: string): Promise<typeof donationSubscriptions.$inferSelect | undefined> {
		return this.db.client.query.donationSubscriptions.findFirst({ where: { cancellationToken: token } });
	}

	async updateSubscriptionStatus(
		id: string,
		status: DonationSubscriptionStatusEnum
	): Promise<typeof donationSubscriptions.$inferSelect | undefined> {
		const patch =
			status === DonationSubscriptionStatusEnum.FAILED ? { status, cancellationToken: null } : { status };
		const [updated] = await this.db.client
			.update(donationSubscriptions)
			.set(patch)
			.where(eq(donationSubscriptions.id, id))
			.returning();
		return updated;
	}

	async setSubscriptionCancellationToken(
		id: string,
		token: string
	): Promise<typeof donationSubscriptions.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(donationSubscriptions)
			.set({ cancellationToken: token })
			.where(eq(donationSubscriptions.id, id))
			.returning();
		return updated;
	}

	async clearSubscriptionCancellationToken(
		id: string
	): Promise<typeof donationSubscriptions.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(donationSubscriptions)
			.set({ cancellationToken: null })
			.where(eq(donationSubscriptions.id, id))
			.returning();
		return updated;
	}

	async markSubscriptionCancelled(
		id: string,
		cancelledAt: Date
	): Promise<typeof donationSubscriptions.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(donationSubscriptions)
			.set({ status: DonationSubscriptionStatusEnum.CANCELLED, cancelledAt, cancellationToken: null })
			.where(and(eq(donationSubscriptions.id, id)))
			.returning();
		return updated;
	}
}
