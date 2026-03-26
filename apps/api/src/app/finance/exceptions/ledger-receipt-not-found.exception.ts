import { NotFoundException } from '@nestjs/common';

export class LedgerReceiptNotFoundException extends NotFoundException {
	constructor(ledgerEntryId: string) {
		super(`Чек для проводки ${ledgerEntryId} не найден`);
	}
}
