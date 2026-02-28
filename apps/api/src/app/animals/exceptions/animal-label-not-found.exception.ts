import { NotFoundException } from '@nestjs/common';

export class AnimalLabelNotFoundException extends NotFoundException {
	constructor(id: string) {
		super(`Ярлык с ID ${id} не найден`);
	}
}
