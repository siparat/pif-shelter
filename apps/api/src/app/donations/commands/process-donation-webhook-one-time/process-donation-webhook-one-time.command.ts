import { Command } from '@nestjs/cqrs';
import { PaymentWebhookPayload, PaymentWebhookResponse } from '@pif/contracts';

export class ProcessDonationWebhookOneTimeCommand extends Command<PaymentWebhookResponse['data']> {
	constructor(public readonly payload: PaymentWebhookPayload) {
		super();
	}
}
