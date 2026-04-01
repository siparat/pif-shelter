import { NotFoundException } from '@nestjs/common';

export class AnimalNotFoundException extends NotFoundException {
	constructor() {
		super('Питомец не найден, для него невозможно открыть сбор');
	}
}
