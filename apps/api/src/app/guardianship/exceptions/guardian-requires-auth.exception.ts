import { ConflictException } from '@nestjs/common';

export class GuardianRequiresAuthException extends ConflictException {
	constructor() {
		super(
			'Пользователь с таким email или telegram уже зарегистрирован. Войдите в аккаунт, чтобы оформить опекунство.'
		);
	}
}
