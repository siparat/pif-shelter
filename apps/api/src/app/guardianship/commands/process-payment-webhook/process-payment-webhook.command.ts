import { Command } from '@nestjs/cqrs';
import { PaymentWebhookEvent } from '@pif/payment';

export class ProcessPaymentWebhookCommand extends Command<{ guardianshipId: string; activated: boolean }> {
	constructor(
		public readonly subscriptionId: string,
		public readonly event: PaymentWebhookEvent
	) {
		super();
	}
}
