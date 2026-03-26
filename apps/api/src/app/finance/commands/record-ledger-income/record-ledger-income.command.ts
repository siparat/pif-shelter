import { Command } from '@nestjs/cqrs';
import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';

export type RecordLedgerIncomePayload = {
	source: LedgerEntrySourceEnum;
	grossAmount: number;
	feeAmount: number;
	netAmount: number;
	occurredAt: Date;
	title: string;
	providerPaymentId: string;
	donorDisplayName?: string | null;
	note?: string | null;
	donationOneTimeIntentId?: string | null;
	donationSubscriptionId?: string | null;
	guardianshipId?: string | null;
};

export class RecordLedgerIncomeCommand extends Command<{ id: string }> {
	readonly direction = LedgerEntryDirectionEnum.INCOME;

	constructor(public readonly payload: RecordLedgerIncomePayload) {
		super();
	}
}
