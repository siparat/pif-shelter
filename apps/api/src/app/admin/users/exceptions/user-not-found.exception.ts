import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
	constructor(userId: string) {
		super(`Пользователь с id ${userId} не найден`);
	}
}
