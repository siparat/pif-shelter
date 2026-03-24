import { ledgerEntries } from '@pif/database';
import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { InferInsertModel } from 'drizzle-orm';
import {
	CreateManualExpensePayload,
	RecordIncomePayload,
	UpdateManualExpensePayload
} from '../repositories/abstract-ledger.repository';

type LedgerEntryInsertModel = InferInsertModel<typeof ledgerEntries>;
type LedgerEntryUpdateModel = Partial<typeof ledgerEntries.$inferInsert>;

export class LedgerMapper {
	static toIncomeInsert(payload: RecordIncomePayload): LedgerEntryInsertModel {
		return {
			direction: LedgerEntryDirectionEnum.INCOME,
			source: payload.source,
			grossAmount: payload.grossAmount,
			feeAmount: payload.feeAmount,
			netAmount: payload.netAmount,
			currency: 'RUB',
			occurredAt: payload.occurredAt,
			title: payload.title,
			note: payload.note ?? null,
			donorDisplayName: payload.donorDisplayName ?? null,
			providerPaymentId: payload.providerPaymentId,
			donationOneTimeIntentId: payload.donationOneTimeIntentId ?? null,
			donationSubscriptionId: payload.donationSubscriptionId ?? null,
			guardianshipId: payload.guardianshipId ?? null
		};
	}

	static toManualExpenseInsert(payload: CreateManualExpensePayload): LedgerEntryInsertModel {
		return {
			direction: LedgerEntryDirectionEnum.EXPENSE,
			source: LedgerEntrySourceEnum.MANUAL_EXPENSE,
			grossAmount: payload.amount,
			feeAmount: 0,
			netAmount: payload.amount,
			currency: 'RUB',
			occurredAt: payload.occurredAt,
			title: payload.title,
			note: payload.note ?? null,
			receiptStorageKey: payload.receiptStorageKey,
			createdByUserId: payload.createdByUserId
		};
	}

	static toManualExpenseUpdate(payload: UpdateManualExpensePayload): LedgerEntryUpdateModel {
		const patch: LedgerEntryUpdateModel = {};
		if (payload.amount !== undefined) {
			patch.grossAmount = payload.amount;
			patch.netAmount = payload.amount;
			patch.feeAmount = 0;
		}
		if (payload.occurredAt !== undefined) {
			patch.occurredAt = payload.occurredAt;
		}
		if (payload.title !== undefined) {
			patch.title = payload.title;
		}
		if (payload.note !== undefined) {
			patch.note = payload.note;
		}
		if (payload.receiptStorageKey !== undefined) {
			patch.receiptStorageKey = payload.receiptStorageKey;
		}
		return patch;
	}
}
