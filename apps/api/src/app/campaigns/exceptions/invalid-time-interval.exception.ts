import { BadRequestException } from '@nestjs/common';

export class InvalidTimeIntervalException extends BadRequestException {
	constructor() {
		super('Конец сбора не может быть раньше его начала');
	}
}
