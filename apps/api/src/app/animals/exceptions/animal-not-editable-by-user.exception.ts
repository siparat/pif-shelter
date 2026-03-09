import { ForbiddenException } from '@nestjs/common';

export class AnimalNotEditableByUserException extends ForbiddenException {
	constructor() {
		super('Волонтер может редактировать только животных, к которым привязан как куратор');
	}
}
