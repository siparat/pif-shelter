import { ForbiddenException } from '@nestjs/common';

export class InvitationHasExpiredException extends ForbiddenException {
	constructor() {
		super('Приглашение истекло, попросите менеджера отправить его повторно');
	}
}
