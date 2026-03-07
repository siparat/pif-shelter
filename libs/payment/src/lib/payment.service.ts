import { Injectable, Logger } from '@nestjs/common';
import { IGeneratedPayment } from './interfaces/payment.interface';

@Injectable()
export class PaymentService {
	private logger = new Logger(PaymentService.name);

	async generatePaymentLink(
		type: 'one' | 'subscription',
		transactionId: string,
		amount: number
	): Promise<IGeneratedPayment> {
		return {
			amount,
			url: `https://mock-payment-service.ru/${type}?transaction-id=${transactionId}&amount=${amount}&currency=RUB`
		};
	}

	async changeCostSubscription(subscriptionId: string, amount: number): Promise<{ amount: number }> {
		this.logger.log(`Стоимость подписки ${subscriptionId} изменена на ${amount}`);
		return { amount };
	}

	async refundSubscription(subscriptionId: string): Promise<void> {
		this.logger.log(`Средства за подписку ${subscriptionId} возвращены`);
	}

	async cancelSubscription(subscriptionId: string): Promise<boolean> {
		this.logger.log(`Подписка ${subscriptionId} отменена`);
		return true;
	}
}
