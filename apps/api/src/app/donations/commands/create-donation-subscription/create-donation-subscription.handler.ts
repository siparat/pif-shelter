import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { DonationSubscriptionInitiatedEvent } from '../../events/donation-subscription-initiated.event';
import { AbstractDonationIntentsRepository } from '../../repositories/abstract-donation-intents.repository';
import { CreateDonationSubscriptionCommand } from './create-donation-subscription.command';

@CommandHandler(CreateDonationSubscriptionCommand)
export class CreateDonationSubscriptionHandler implements ICommandHandler<CreateDonationSubscriptionCommand> {
	constructor(
		private readonly repository: AbstractDonationIntentsRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto }: CreateDonationSubscriptionCommand): Promise<{ paymentUrl: string; subscriptionId: string }> {
		const subscriptionId = randomUUID();
		const subscription = await this.repository.createSubscriptionPending({
			subscriptionId,
			displayName: dto.displayName,
			hidePublicName: dto.hidePublicName,
			amountPerPeriod: dto.amountPerMonth
		});
		const payment = await this.paymentService.generateDonationSubscriptionLink({
			subscriptionId,
			amountPerMonth: dto.amountPerMonth
		});

		this.eventBus.publish(new DonationSubscriptionInitiatedEvent(subscription));
		this.logger.log('Создана донат-подписка', { subscriptionId: subscription.subscriptionId, id: subscription.id });

		return { paymentUrl: payment.url, subscriptionId };
	}
}
