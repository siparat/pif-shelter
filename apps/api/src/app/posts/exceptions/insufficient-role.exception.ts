import { ForbiddenException } from '@nestjs/common';

export class InsufficientRoleException extends ForbiddenException {
	constructor() {
		super('У вас недостаточно прав для выполнения этого действия');
	}
}
