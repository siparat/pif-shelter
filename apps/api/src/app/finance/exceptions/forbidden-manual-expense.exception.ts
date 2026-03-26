import { ForbiddenException } from '@nestjs/common';

export class ForbiddenManualExpenseException extends ForbiddenException {
	constructor() {
		super('Недостаточно прав для управления данным расходом');
	}
}
