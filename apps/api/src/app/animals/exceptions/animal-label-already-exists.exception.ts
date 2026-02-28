import { ConflictException } from '@nestjs/common';

export class AnimalLabelAlreadyExistsException extends ConflictException {
	constructor(name: string) {
		super(`Ярлык с именем "${name}" уже существует`);
	}
}
