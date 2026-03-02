import { ConflictException } from '@nestjs/common';

export class AnimalAlreadyHasGuardianException extends ConflictException {
	constructor() {
		super('У этого животного уже есть активный опекун');
	}
}
