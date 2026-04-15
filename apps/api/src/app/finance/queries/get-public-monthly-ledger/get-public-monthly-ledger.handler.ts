import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { campaigns, DatabaseService, donationOneTimeIntents, ledgerEntries } from '@pif/database';
import { LedgerCacheKeys } from '@pif/shared';
import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { PublicLedgerReportResponseDto, ReturnData } from '../../../core/dto';
import { GetPublicMonthlyLedgerQuery } from './get-public-monthly-ledger.query';

@QueryHandler(GetPublicMonthlyLedgerQuery)
export class GetPublicMonthlyLedgerHandler implements IQueryHandler<GetPublicMonthlyLedgerQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto }: GetPublicMonthlyLedgerQuery): Promise<ReturnData<typeof PublicLedgerReportResponseDto>> {
		const cacheKey = LedgerCacheKeys.monthPublic(dto.year, dto.month);
		const cached = await this.cache
			.get<ReturnData<typeof PublicLedgerReportResponseDto>>(cacheKey)
			.catch(() => null);
		if (cached) {
			return cached;
		}

		const start = new Date(Date.UTC(dto.year, dto.month - 1, 1, 0, 0, 0, 0));
		const end = new Date(Date.UTC(dto.year, dto.month, 1, 0, 0, 0, 0));
		const rows = await this.db.client
			.select({
				id: ledgerEntries.id,
				direction: ledgerEntries.direction,
				source: ledgerEntries.source,
				grossAmount: ledgerEntries.grossAmount,
				feeAmount: ledgerEntries.feeAmount,
				netAmount: ledgerEntries.netAmount,
				currency: ledgerEntries.currency,
				occurredAt: ledgerEntries.occurredAt,
				title: ledgerEntries.title,
				note: ledgerEntries.note,
				donorDisplayName: ledgerEntries.donorDisplayName,
				receiptStorageKey: ledgerEntries.receiptStorageKey,
				campaignId: campaigns.id,
				campaignTitle: campaigns.title
			})
			.from(ledgerEntries)
			.leftJoin(donationOneTimeIntents, eq(ledgerEntries.donationOneTimeIntentId, donationOneTimeIntents.id))
			.leftJoin(campaigns, eq(donationOneTimeIntents.campaignId, campaigns.id))
			.where(and(gte(ledgerEntries.occurredAt, start), lt(ledgerEntries.occurredAt, end)))
			.orderBy(asc(ledgerEntries.occurredAt));

		const result = rows.map((row) => ({
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
			campaignId: row.campaignId ?? null,
			campaignTitle: row.campaignTitle ?? null,
			receiptStorageKey: row.receiptStorageKey ?? null
		}));

		await this.cache.set(cacheKey, result).catch(() => undefined);
		return result;
	}
}
