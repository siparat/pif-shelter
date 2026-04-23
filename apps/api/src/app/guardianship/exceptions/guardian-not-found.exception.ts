import { NotFoundException } from '@nestjs/common';

export class GuardianNotFoundException extends NotFoundException {
	constructor() {
		super('Опекун не найден');
	}
}
