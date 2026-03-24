import { ledgerEntries } from '@pif/database';

export class ManualExpenseUpdatedEvent {
	constructor(public readonly entry: typeof ledgerEntries.$inferSelect) {}
}
