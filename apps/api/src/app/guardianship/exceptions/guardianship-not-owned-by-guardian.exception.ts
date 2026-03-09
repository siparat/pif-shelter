import { ForbiddenException } from '@nestjs/common';

export class GuardianshipNotOwnedByGuardianException extends ForbiddenException {
	constructor() {
		super('Вы можете отменить только своё опекунство');
	}
}
