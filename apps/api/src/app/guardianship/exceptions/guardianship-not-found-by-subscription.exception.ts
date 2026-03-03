import { NotFoundException } from '@nestjs/common';

export class GuardianshipNotFoundBySubscriptionException extends NotFoundException {
	constructor() {
		super('Опекунство с указанным идентификатором подписки не найдено');
	}
}
