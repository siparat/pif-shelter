import { ConflictException } from '@nestjs/common';

export class DuplicateProviderPaymentException extends ConflictException {
	constructor(providerPaymentId: string) {
		super(`Платеж с providerPaymentId ${providerPaymentId} уже обработан`);
	}
}
