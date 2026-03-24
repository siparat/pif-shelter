import { ledgerEntries } from '@pif/database';
import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';

export type RecordIncomePayload = {
	source: LedgerEntrySourceEnum;
	grossAmount: number;
	feeAmount: number;
	netAmount: number;
	occurredAt: Date;
	title: string;
	note?: string | null;
	donorDisplayName?: string | null;
	providerPaymentId: string;
	donationOneTimeIntentId?: string | null;
	donationSubscriptionId?: string | null;
	guardianshipId?: string | null;
};

export type CreateManualExpensePayload = {
	amount: number;
	occurredAt: Date;
	title: string;
	note?: string | null;
	receiptStorageKey: string;
	createdByUserId: string;
};

export type UpdateManualExpensePayload = {
	id: string;
	amount?: number;
	occurredAt?: Date;
	title?: string;
	note?: string | null;
	receiptStorageKey?: string;
};

export abstract class AbstractLedgerRepository {
	abstract insertIncome(payload: RecordIncomePayload): Promise<typeof ledgerEntries.$inferSelect>;
	abstract insertExpense(payload: CreateManualExpensePayload): Promise<typeof ledgerEntries.$inferSelect>;
	abstract findByProviderPaymentId(providerPaymentId: string): Promise<typeof ledgerEntries.$inferSelect | undefined>;
	abstract updateExpense(payload: UpdateManualExpensePayload): Promise<typeof ledgerEntries.$inferSelect | undefined>;
	abstract deleteExpense(id: string): Promise<boolean>;
	abstract findById(id: string): Promise<typeof ledgerEntries.$inferSelect | undefined>;
	abstract findByMonthRange(start: Date, endExclusive: Date): Promise<(typeof ledgerEntries.$inferSelect)[]>;
	abstract findByIdAndDirection(
		id: string,
		direction: LedgerEntryDirectionEnum
	): Promise<typeof ledgerEntries.$inferSelect | undefined>;
}
