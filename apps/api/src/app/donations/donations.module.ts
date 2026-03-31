import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentModule } from '@pif/payment';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { CancelDonationSubscriptionByTokenHandler } from './commands/cancel-donation-subscription-by-token/cancel-donation-subscription-by-token.handler';
import { CreateDonationOneTimeHandler } from './commands/create-donation-one-time/create-donation-one-time.handler';
import { CreateDonationSubscriptionHandler } from './commands/create-donation-subscription/create-donation-subscription.handler';
import { ProcessDonationWebhookOneTimeHandler } from './commands/process-donation-webhook-one-time/process-donation-webhook-one-time.handler';
import { ProcessDonationWebhookSubscriptionHandler } from './commands/process-donation-webhook-subscription/process-donation-webhook-subscription.handler';
import { DonationsController } from './donations.controller';
import { DonationIntentsRepository } from './repositories/donation-intents.repository';
import { DrizzleDonationIntentsRepository } from './repositories/drizzle-donation-intents.repository';
import { SendDonationSubscriptionCancelLinkEmailHandler } from './events/donation-subscription-initiated/send-donation-subscription-cancel-link-email.handler';

@Module({
	imports: [CqrsModule, PaymentModule, CampaignsModule],
	controllers: [DonationsController],
	providers: [
		CreateDonationOneTimeHandler,
		CreateDonationSubscriptionHandler,
		CancelDonationSubscriptionByTokenHandler,
		ProcessDonationWebhookOneTimeHandler,
		ProcessDonationWebhookSubscriptionHandler,
		SendDonationSubscriptionCancelLinkEmailHandler,
		{
			provide: DonationIntentsRepository,
			useClass: DrizzleDonationIntentsRepository
		}
	]
})
export class DonationsModule {}
