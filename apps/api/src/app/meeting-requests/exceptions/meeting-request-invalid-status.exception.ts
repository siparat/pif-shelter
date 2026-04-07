import { ConflictException } from '@nestjs/common';

export class MeetingRequestInvalidStatusException extends ConflictException {
	constructor() {
		super('Заявка уже обработана');
	}
}
