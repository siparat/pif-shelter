import { Injectable } from '@nestjs/common';
import { EventsHandler, IEvent, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { DatabaseService } from '@pif/database';
import { LedgerCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { LedgerIncomeRecordedEvent } from '../ledger-income-recorded/ledger-income-recorded.event';
import { ManualExpenseCreatedEvent } from '../manual-expense-created/manual-expense-created.event';
import { ManualExpenseDeletedEvent } from '../manual-expense-deleted/manual-expense-deleted.event';
import { ManualExpenseUpdatedEvent } from '../manual-expense-updated/manual-expense-updated.event';

@Injectable()
@EventsHandler(
	LedgerIncomeRecordedEvent,
	ManualExpenseCreatedEvent,
	ManualExpenseUpdatedEvent,
	ManualExpenseDeletedEvent
)
export class InvalidateMonthlyLedgerCacheHandler implements IEventHandler<IEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly db: DatabaseService,
		private readonly logger: Logger
	) {}

	async handle(
		event:
			| ManualExpenseDeletedEvent
			| LedgerIncomeRecordedEvent
			| ManualExpenseCreatedEvent
			| ManualExpenseUpdatedEvent
	): Promise<void> {
		if (event instanceof ManualExpenseDeletedEvent) {
			return this.invalidateByDeletedId(event.id);
		}
		return this.invalidateByOccurredAt(event.entry.occurredAt);
	}

	private async invalidateByOccurredAt(occurredAt: Date): Promise<void> {
		const date = new Date(occurredAt);
		const year = date.getUTCFullYear();
		const month = date.getUTCMonth() + 1;

		const internalKey = LedgerCacheKeys.monthInternal(year, month);
		const publicKey = LedgerCacheKeys.monthPublic(year, month);

		try {
			await Promise.all([this.cache.del(internalKey), this.cache.del(publicKey)]);
		} catch (error) {
			this.logger.warn('Не удалось сбросить кэш месячного ledger', {
				year,
				month,
				err: error instanceof Error ? error.message : error
			});
		}
	}

	private async invalidateByDeletedId(id: string): Promise<void> {
		const row = await this.db.client.query.ledgerEntries.findFirst({ where: { id } });
		if (!row?.occurredAt) {
			this.logger.debug('Пропуск сброса кэша месячного ledger: ledger entry для deleted не найден', { id });
			return;
		}

		await this.invalidateByOccurredAt(row.occurredAt);
	}
}
