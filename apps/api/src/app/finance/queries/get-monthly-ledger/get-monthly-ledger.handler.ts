import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { campaigns, DatabaseService, donationOneTimeIntents, ledgerEntries } from '@pif/database';
import { LedgerCacheKeys } from '@pif/shared';
import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { ListLedgerForMonthResponseDto, ReturnData } from '../../../core/dto';
import { GetMonthlyLedgerQuery } from './get-monthly-ledger.query';

@QueryHandler(GetMonthlyLedgerQuery)
export class GetMonthlyLedgerHandler implements IQueryHandler<GetMonthlyLedgerQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto }: GetMonthlyLedgerQuery): Promise<ReturnData<typeof ListLedgerForMonthResponseDto>> {
		const cacheKey = LedgerCacheKeys.monthInternal(dto.year, dto.month);
		const cached = await this.cache
			.get<ReturnData<typeof ListLedgerForMonthResponseDto>>(cacheKey)
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
				providerPaymentId: ledgerEntries.providerPaymentId,
				donationOneTimeIntentId: ledgerEntries.donationOneTimeIntentId,
				donationSubscriptionId: ledgerEntries.donationSubscriptionId,
				guardianshipId: ledgerEntries.guardianshipId,
				receiptStorageKey: ledgerEntries.receiptStorageKey,
				createdByUserId: ledgerEntries.createdByUserId,
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
			providerPaymentId: row.providerPaymentId ?? null,
			donationOneTimeIntentId: row.donationOneTimeIntentId ?? null,
			campaignId: row.campaignId ?? null,
			campaignTitle: row.campaignTitle ?? null,
			donationSubscriptionId: row.donationSubscriptionId ?? null,
			guardianshipId: row.guardianshipId ?? null,
			receiptStorageKey: row.receiptStorageKey ?? null,
			createdByUserId: row.createdByUserId ?? null
		}));

		await this.cache.set(cacheKey, result).catch(() => undefined);
		return result;
	}
}
