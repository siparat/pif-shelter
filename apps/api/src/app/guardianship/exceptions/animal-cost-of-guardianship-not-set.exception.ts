import { UnprocessableEntityException } from '@nestjs/common';

export class AnimalCostOfGuardianshipNotSetException extends UnprocessableEntityException {
	constructor(name: string) {
		super(`У животного ${name} не задана стоимость опекунства`);
	}
}
