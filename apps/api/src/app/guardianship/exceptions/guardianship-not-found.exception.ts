import { NotFoundException } from '@nestjs/common';

export class GuardianshipNotFoundException extends NotFoundException {
	constructor() {
		super('Опекунство не найдено, свяжитесь с поддержкой');
	}
}
