import { Command } from '@nestjs/cqrs';
import { PaymentWebhookEvent } from '@pif/payment';

export type ProcessPaymentWebhookResult = {
	guardianshipId: string;
	activated?: boolean;
	cancelled?: boolean;
};

export class ProcessPaymentWebhookCommand extends Command<ProcessPaymentWebhookResult> {
	constructor(
		public readonly subscriptionId: string,
		public readonly event: PaymentWebhookEvent
	) {
		super();
	}
}
