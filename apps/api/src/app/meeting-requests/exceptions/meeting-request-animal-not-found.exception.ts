import { NotFoundException } from '@nestjs/common';

export class MeetingRequestAnimalNotFoundException extends NotFoundException {
	constructor() {
		super('Животное для заявки не найдено');
	}
}
