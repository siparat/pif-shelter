import { NotFoundException } from '@nestjs/common';

export class InvitationNotFoundException extends NotFoundException {
	constructor() {
		super('Приглашение для вас не найдено');
	}
}
