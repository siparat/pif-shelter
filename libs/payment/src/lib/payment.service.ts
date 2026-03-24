import { Injectable, Logger } from '@nestjs/common';
import { MOCK_PAYMENT_FEE_BASIS_POINTS } from '@pif/shared';
import {
	DonationOneTimeParams,
	DonationSubscriptionParams,
	IGeneratedDonationSubscriptionPayment,
	IGeneratedPayment
} from './interfaces/payment.interface';

@Injectable()
export class PaymentService {
	private logger = new Logger(PaymentService.name);

	async generatePaymentLink(
		type: 'one' | 'subscription',
		transactionId: string,
		amount: number
	): Promise<IGeneratedPayment> {
		if (type === 'one') {
			return this.generateDonationOneTimeLink({ transactionId, amount });
		}

		return {
			amount,
			url: this.buildMockPaymentUrl('subscription', [
				['transaction-id', transactionId],
				['amount', String(amount)],
				['currency', 'RUB']
			])
		};
	}

	async generateDonationOneTimeLink(params: DonationOneTimeParams): Promise<IGeneratedPayment> {
		const { transactionId, amount } = params;
		return {
			amount,
			url: this.buildMockPaymentUrl('donation-one', [
				['purpose', 'donation_one'],
				['transaction-id', transactionId],
				['amount', String(amount)],
				['currency', 'RUB']
			])
		};
	}

	async generateDonationSubscriptionLink(
		params: DonationSubscriptionParams
	): Promise<IGeneratedDonationSubscriptionPayment> {
		const { subscriptionId, amountPerMonth } = params;
		return {
			subscriptionId,
			amountPerMonth,
			url: this.buildMockPaymentUrl('donation-subscription', [
				['purpose', 'donation_subscription'],
				['subscription-id', subscriptionId],
				['amount_per_month', String(amountPerMonth)],
				['currency', 'RUB']
			])
		};
	}

	calculateMockFeeNet(gross: number): { fee: number; net: number } {
		const fee = Math.round((gross * MOCK_PAYMENT_FEE_BASIS_POINTS) / 10000);
		return { fee, net: gross - fee };
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

	private buildMockPaymentUrl(path: string, queryEntries: Array<[string, string]>): string {
		const params = new URLSearchParams();
		for (const [key, value] of queryEntries) {
			params.set(key, value);
		}
		return `https://mock-payment-service.ru/${path}?${params.toString()}`;
	}
}
