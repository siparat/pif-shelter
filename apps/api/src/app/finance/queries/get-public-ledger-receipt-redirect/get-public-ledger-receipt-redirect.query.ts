import { Query } from '@nestjs/cqrs';

export class GetPublicLedgerReceiptRedirectQuery extends Query<{ url: string }> {
	constructor(public readonly ledgerEntryId: string) {
		super();
	}
}
