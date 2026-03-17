import { ForbiddenException } from '@nestjs/common';

export class NotCuratorException extends ForbiddenException {
	constructor() {
		super('Вы не являетесь куратором этого животного');
	}
}
