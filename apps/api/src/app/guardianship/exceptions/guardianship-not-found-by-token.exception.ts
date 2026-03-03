import { NotFoundException } from '@nestjs/common';

export class GuardianshipNotFoundByTokenException extends NotFoundException {
	constructor() {
		super('Ссылка для отмены недействительна или уже использована');
	}
}
