import { NotFoundException } from '@nestjs/common';

export class LedgerEntryNotFoundException extends NotFoundException {
	constructor(id: string) {
		super(`Проводка с ID ${id} не найдена`);
	}
}
