import { ledgerEntries } from '@pif/database';

export class LedgerIncomeRecordedEvent {
	constructor(public readonly entry: typeof ledgerEntries.$inferSelect) {}
}
