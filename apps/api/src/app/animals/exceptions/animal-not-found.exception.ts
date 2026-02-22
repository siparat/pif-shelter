import { NotFoundException } from '@nestjs/common';

export class AnimalNotFoundException extends NotFoundException {
	constructor(id: string) {
		super(`Животное с ID ${id} не найдено`);
	}
}
