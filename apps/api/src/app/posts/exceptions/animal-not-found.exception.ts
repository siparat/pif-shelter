import { NotFoundException } from '@nestjs/common';

export class AnimalNotFoundException extends NotFoundException {
	constructor(animalId: string) {
		super(`Животное с ID ${animalId} не найдено`);
	}
}
