import { ForbiddenException } from '@nestjs/common';

export class NotGuardianException extends ForbiddenException {
	constructor() {
		super('Вы не являетесь опекуном этого животного');
	}
}
