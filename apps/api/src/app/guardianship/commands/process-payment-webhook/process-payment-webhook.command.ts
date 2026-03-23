import { Command } from '@nestjs/cqrs';
import type { PaymentWebhookPayload, PaymentWebhookResponse } from '@pif/contracts';

export class ProcessPaymentWebhookCommand extends Command<PaymentWebhookResponse> {
	constructor(public readonly payload: PaymentWebhookPayload) {
		super();
	}
}
