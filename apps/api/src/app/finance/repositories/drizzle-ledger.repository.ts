import { Injectable } from '@nestjs/common';
import { DatabaseService, ledgerEntries } from '@pif/database';
import { LedgerEntryDirectionEnum } from '@pif/shared';
import { and, asc, eq, gte, lt } from 'drizzle-orm';
import { LedgerMapper } from '../mappers/ledger.mapper';
import {
	CreateManualExpensePayload,
	LedgerRepository,
	RecordIncomePayload,
	UpdateManualExpensePayload
} from './ledger.repository';

@Injectable()
export class DrizzleLedgerRepository implements LedgerRepository {
	constructor(private readonly db: DatabaseService) {}

	async insertIncome(payload: RecordIncomePayload): Promise<typeof ledgerEntries.$inferSelect> {
		const [created] = await this.db.client
			.insert(ledgerEntries)
			.values(LedgerMapper.toIncomeInsert(payload))
			.returning();

		return created;
	}

	async insertExpense(payload: CreateManualExpensePayload): Promise<typeof ledgerEntries.$inferSelect> {
		const [created] = await this.db.client
			.insert(ledgerEntries)
			.values(LedgerMapper.toManualExpenseInsert(payload))
			.returning();

		return created;
	}

	findByProviderPaymentId(providerPaymentId: string): Promise<typeof ledgerEntries.$inferSelect | undefined> {
		return this.db.client.query.ledgerEntries.findFirst({ where: { providerPaymentId } });
	}

	async updateExpense(payload: UpdateManualExpensePayload): Promise<typeof ledgerEntries.$inferSelect | undefined> {
		const patch = LedgerMapper.toManualExpenseUpdate(payload);

		const [updated] = await this.db.client
			.update(ledgerEntries)
			.set(patch)
			.where(and(eq(ledgerEntries.id, payload.id), eq(ledgerEntries.direction, LedgerEntryDirectionEnum.EXPENSE)))
			.returning();

		return updated;
	}

	async deleteExpense(id: string): Promise<boolean> {
		const [deleted] = await this.db.client
			.delete(ledgerEntries)
			.where(and(eq(ledgerEntries.id, id), eq(ledgerEntries.direction, LedgerEntryDirectionEnum.EXPENSE)))
			.returning({ id: ledgerEntries.id });
		return !!deleted;
	}

	findById(id: string): Promise<typeof ledgerEntries.$inferSelect | undefined> {
		return this.db.client.query.ledgerEntries.findFirst({ where: { id } });
	}

	findByIdAndDirection(
		id: string,
		direction: LedgerEntryDirectionEnum
	): Promise<typeof ledgerEntries.$inferSelect | undefined> {
		return this.db.client.query.ledgerEntries.findFirst({
			where: { id, direction }
		});
	}

	findByMonthRange(start: Date, endExclusive: Date): Promise<(typeof ledgerEntries.$inferSelect)[]> {
		return this.db.client
			.select()
			.from(ledgerEntries)
			.where(and(gte(ledgerEntries.occurredAt, start), lt(ledgerEntries.occurredAt, endExclusive)))
			.orderBy(asc(ledgerEntries.occurredAt));
	}
}
