import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentModule } from '@pif/payment';
import { CancelDonationSubscriptionHandler } from './commands/cancel-donation-subscription/cancel-donation-subscription.handler';
import { CreateDonationOneTimeHandler } from './commands/create-donation-one-time/create-donation-one-time.handler';
import { CreateDonationSubscriptionHandler } from './commands/create-donation-subscription/create-donation-subscription.handler';
import { ProcessDonationWebhookOneTimeHandler } from './commands/process-donation-webhook-one-time/process-donation-webhook-one-time.handler';
import { ProcessDonationWebhookSubscriptionHandler } from './commands/process-donation-webhook-subscription/process-donation-webhook-subscription.handler';
import { DonationsController } from './donations.controller';
import { AbstractDonationIntentsRepository } from './repositories/abstract-donation-intents.repository';
import { DrizzleDonationIntentsRepository } from './repositories/drizzle-donation-intents.repository';

@Module({
	imports: [CqrsModule, PaymentModule],
	controllers: [DonationsController],
	providers: [
		CreateDonationOneTimeHandler,
		CreateDonationSubscriptionHandler,
		CancelDonationSubscriptionHandler,
		ProcessDonationWebhookOneTimeHandler,
		ProcessDonationWebhookSubscriptionHandler,
		{
			provide: AbstractDonationIntentsRepository,
			useClass: DrizzleDonationIntentsRepository
		}
	]
})
export class DonationsModule {}
