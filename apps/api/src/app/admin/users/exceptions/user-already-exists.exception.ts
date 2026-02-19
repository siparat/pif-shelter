import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
	constructor() {
		super('Пользователь с таким email уже зарегистрирован');
	}
}
