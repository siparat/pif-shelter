import { Command } from '@nestjs/cqrs';
import { PaymentWebhookPayload, PaymentWebhookResponse } from '@pif/contracts';

export class ProcessDonationWebhookSubscriptionCommand extends Command<PaymentWebhookResponse['data']> {
	constructor(public readonly payload: PaymentWebhookPayload) {
		super();
	}
}
