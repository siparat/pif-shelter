import { NotFoundException } from '@nestjs/common';

export class MeetingRequestNotFoundException extends NotFoundException {
	constructor() {
		super('Заявка на встречу не найдена');
	}
}
