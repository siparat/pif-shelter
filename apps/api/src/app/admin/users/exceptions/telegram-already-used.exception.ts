import { ConflictException } from '@nestjs/common';

export class TelegramAlreadyUsedException extends ConflictException {
	constructor(telegram: string) {
		super(`Телеграм ${telegram} уже используется`);
	}
}
