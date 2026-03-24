import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListLedgerForMonthResponseDto, ReturnDto } from '@pif/contracts';
import { DatabaseService, ledgerEntries } from '@pif/database';
import { and, asc, gte, lt } from 'drizzle-orm';
import { GetMonthlyLedgerQuery } from './get-monthly-ledger.query';

@QueryHandler(GetMonthlyLedgerQuery)
export class GetMonthlyLedgerHandler implements IQueryHandler<GetMonthlyLedgerQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({ dto }: GetMonthlyLedgerQuery): Promise<ReturnDto<typeof ListLedgerForMonthResponseDto>> {
		const start = new Date(Date.UTC(dto.year, dto.month - 1, 1, 0, 0, 0, 0));
		const end = new Date(Date.UTC(dto.year, dto.month, 1, 0, 0, 0, 0));
		const rows = await this.db.client
			.select()
			.from(ledgerEntries)
			.where(and(gte(ledgerEntries.occurredAt, start), lt(ledgerEntries.occurredAt, end)))
			.orderBy(asc(ledgerEntries.occurredAt));

		return rows.map((row) => ({
			id: row.id,
			direction: row.direction,
			source: row.source,
			grossAmount: row.grossAmount,
			feeAmount: row.feeAmount,
			netAmount: row.netAmount,
			currency: row.currency,
			occurredAt: row.occurredAt.toISOString(),
			title: row.title,
			note: row.note ?? null,
			donorDisplayName: row.donorDisplayName ?? null,
			providerPaymentId: row.providerPaymentId ?? null,
			donationOneTimeIntentId: row.donationOneTimeIntentId ?? null,
			donationSubscriptionId: row.donationSubscriptionId ?? null,
			guardianshipId: row.guardianshipId ?? null,
			receiptStorageKey: row.receiptStorageKey ?? null,
			createdByUserId: row.createdByUserId ?? null
		}));
	}
}
