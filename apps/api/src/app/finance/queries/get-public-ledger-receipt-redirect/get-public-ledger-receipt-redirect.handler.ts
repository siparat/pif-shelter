import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { StorageService } from '@pif/storage';
import { LedgerReceiptNotFoundException } from '../../exceptions/ledger-receipt-not-found.exception';
import { GetPublicLedgerReceiptRedirectQuery } from './get-public-ledger-receipt-redirect.query';

@QueryHandler(GetPublicLedgerReceiptRedirectQuery)
export class GetPublicLedgerReceiptRedirectHandler implements IQueryHandler<GetPublicLedgerReceiptRedirectQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly storage: StorageService
	) {}

	async execute({ ledgerEntryId }: GetPublicLedgerReceiptRedirectQuery): Promise<{ url: string }> {
		const entry = await this.db.client.query.ledgerEntries.findFirst({
			where: { id: ledgerEntryId }
		});
		if (!entry?.receiptStorageKey) {
			throw new LedgerReceiptNotFoundException(ledgerEntryId);
		}
		const url = await this.storage.getSignedUrl(entry.receiptStorageKey);
		return { url };
	}
}
