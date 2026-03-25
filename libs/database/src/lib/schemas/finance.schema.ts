import {
	DonationOneTimeIntentStatusEnum,
	DonationSubscriptionStatusEnum,
	LedgerEntryDirectionEnum,
	LedgerEntrySourceEnum
} from '@pif/shared';
import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from './timestamps';
import { guardianships } from './guardianships.schema';
import { users } from './users.schema';

export const donationOneTimeIntentStatusEnum = pgEnum(
	'donation_one_time_intent_status',
	DonationOneTimeIntentStatusEnum
);

export const donationSubscriptionStatusEnum = pgEnum('donation_subscription_status', DonationSubscriptionStatusEnum);

export const ledgerEntryDirectionEnum = pgEnum('ledger_entry_direction', LedgerEntryDirectionEnum);

export const ledgerEntrySourceEnum = pgEnum('ledger_entry_source', LedgerEntrySourceEnum);

export const donationOneTimeIntents = pgTable(
	'donation_one_time_intents',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		transactionId: text('transaction_id').notNull().unique(),
		displayName: text('display_name').notNull(),
		hidePublicName: boolean('hide_public_name').default(false).notNull(),
		expectedAmount: integer('expected_amount').notNull(),
		status: donationOneTimeIntentStatusEnum('status').notNull(),
		providerPaymentId: text('provider_payment_id').unique(),
		...timestamps
	},
	(table) => [index('donation_one_time_intents_status_idx').on(table.status)]
);

export const donationSubscriptions = pgTable('donation_subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	subscriptionId: text('subscription_id').notNull().unique(),
	displayName: text('display_name').notNull(),
	hidePublicName: boolean('hide_public_name').default(false).notNull(),
	amountPerPeriod: integer('amount_per_period').notNull(),
	status: donationSubscriptionStatusEnum('status').notNull(),
	cancellationToken: uuid('cancellation_token').unique(),
	cancelledAt: timestamp('cancelled_at'),
	...timestamps
});

export const ledgerEntries = pgTable(
	'ledger_entries',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		direction: ledgerEntryDirectionEnum('direction').notNull(),
		source: ledgerEntrySourceEnum('source').notNull(),
		grossAmount: integer('gross_amount').notNull(),
		feeAmount: integer('fee_amount').notNull(),
		netAmount: integer('net_amount').notNull(),
		currency: text('currency').default('RUB').notNull(),
		occurredAt: timestamp('occurred_at').notNull(),
		title: text('title').notNull(),
		note: text('note'),
		donorDisplayName: text('donor_display_name'),
		providerPaymentId: text('provider_payment_id').unique(),
		donationOneTimeIntentId: uuid('donation_one_time_intent_id').references(() => donationOneTimeIntents.id, {
			onDelete: 'set null'
		}),
		donationSubscriptionId: uuid('donation_subscription_id').references(() => donationSubscriptions.id, {
			onDelete: 'set null'
		}),
		guardianshipId: uuid('guardianship_id').references(() => guardianships.id, { onDelete: 'set null' }),
		receiptStorageKey: text('receipt_storage_key'),
		createdByUserId: text('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
		...timestamps
	},
	(table) => [
		index('ledger_entries_occurred_at_idx').on(table.occurredAt),
		index('ledger_entries_source_idx').on(table.source)
	]
);
