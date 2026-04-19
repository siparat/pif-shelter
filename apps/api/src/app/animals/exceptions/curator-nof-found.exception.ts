import { NotFoundException } from '@nestjs/common';

export class CuratorNotFoundException extends NotFoundException {
	constructor(curatorId: string) {
		super(`Куратор ${curatorId} не найден`);
	}
}
