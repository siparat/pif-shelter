import { ForbiddenException } from '@nestjs/common';

export class RoleForbiddenException extends ForbiddenException {
	constructor() {
		super('У вас нет прав для доступа к этому ресурсу');
	}
}
