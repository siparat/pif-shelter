import { UnprocessableEntityException } from '@nestjs/common';

export class AnimalNotPublishedException extends UnprocessableEntityException {
	constructor(name: string) {
		super(`${name} не доступен для опекунства`);
	}
}
