import { ForbiddenException } from '@nestjs/common';

export class ForbiddenMeetingRequestAccessException extends ForbiddenException {
	constructor() {
		super('Нет прав для обработки этой заявки');
	}
}
