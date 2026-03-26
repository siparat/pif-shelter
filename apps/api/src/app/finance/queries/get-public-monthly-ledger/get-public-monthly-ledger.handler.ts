import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PublicLedgerReportResponseDto, ReturnDto } from '@pif/contracts';
import { CacheService } from '@pif/cache';
import { LedgerCacheKeys } from '@pif/shared';
import { DatabaseService, ledgerEntries } from '@pif/database';
import { and, asc, gte, lt } from 'drizzle-orm';
import { GetPublicMonthlyLedgerQuery } from './get-public-monthly-ledger.query';

@QueryHandler(GetPublicMonthlyLedgerQuery)
export class GetPublicMonthlyLedgerHandler implements IQueryHandler<GetPublicMonthlyLedgerQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto }: GetPublicMonthlyLedgerQuery): Promise<ReturnDto<typeof PublicLedgerReportResponseDto>> {
		const cacheKey = LedgerCacheKeys.monthPublic(dto.year, dto.month);
		const cached = await this.cache
			.get<ReturnDto<typeof PublicLedgerReportResponseDto>>(cacheKey)
			.catch(() => null);
		if (cached) {
			return cached;
		}

		const start = new Date(Date.UTC(dto.year, dto.month - 1, 1, 0, 0, 0, 0));
		const end = new Date(Date.UTC(dto.year, dto.month, 1, 0, 0, 0, 0));
		const rows = await this.db.client
			.select()
			.from(ledgerEntries)
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
			receiptStorageKey: row.receiptStorageKey ?? null
		}));

		await this.cache.set(cacheKey, result).catch(() => undefined);
		return result;
	}
}
