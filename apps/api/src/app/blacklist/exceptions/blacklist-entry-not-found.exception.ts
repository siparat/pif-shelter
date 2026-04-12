import { NotFoundException } from '@nestjs/common';

export class BlacklistEntryNotFoundException extends NotFoundException {
	constructor(id: string) {
		super(`Запись черного списка не найдена: ${id}`);
	}
}
