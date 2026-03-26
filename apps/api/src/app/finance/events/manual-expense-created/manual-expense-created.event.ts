import { ledgerEntries } from '@pif/database';

export class ManualExpenseCreatedEvent {
	constructor(public readonly entry: typeof ledgerEntries.$inferSelect) {}
}
