import { ServiceUnavailableException } from '@nestjs/common';

export class PaymentServiceUnavailableException extends ServiceUnavailableException {
	constructor() {
		super('Сервис по оплате не работает, попробуйте позже');
	}
}
