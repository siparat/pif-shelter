import { ForbiddenException } from '@nestjs/common';

export class AnimalIsNotWithUsException extends ForbiddenException {
	constructor(name: string) {
		super(`Для питомца ${name} нельзя открывать сборы, его уже нет в приюте`);
	}
}
