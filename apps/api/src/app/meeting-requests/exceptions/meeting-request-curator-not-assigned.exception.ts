import { UnprocessableEntityException } from '@nestjs/common';

export class MeetingRequestCuratorNotAssignedException extends UnprocessableEntityException {
	constructor() {
		super('Для животного не назначен куратор');
	}
}
