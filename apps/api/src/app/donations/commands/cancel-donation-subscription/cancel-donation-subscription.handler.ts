import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { DonationSubscriptionStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { DonationSubscriptionCancelledEvent } from '../../events/donation-subscription-cancelled.event';
import { DonationSubscriptionNotFoundException } from '../../exceptions/donation-subscription-not-found.exception';
import { AbstractDonationIntentsRepository } from '../../repositories/abstract-donation-intents.repository';
import { CancelDonationSubscriptionCommand } from './cancel-donation-subscription.command';

@CommandHandler(CancelDonationSubscriptionCommand)
export class CancelDonationSubscriptionHandler implements ICommandHandler<CancelDonationSubscriptionCommand> {
	constructor(
		private readonly repository: AbstractDonationIntentsRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto }: CancelDonationSubscriptionCommand): Promise<{ cancelled: boolean }> {
		const subscription = await this.repository.findSubscriptionBySubscriptionId(dto.subscriptionId);
		if (!subscription) {
			throw new DonationSubscriptionNotFoundException(dto.subscriptionId);
		}

		if (subscription.status === DonationSubscriptionStatusEnum.CANCELLED) {
			return { cancelled: false };
		}

		await this.paymentService.cancelSubscription(subscription.subscriptionId);
		const updated = await this.repository.markSubscriptionCancelled(subscription.id, new Date());
		if (updated) {
			this.eventBus.publish(new DonationSubscriptionCancelledEvent(updated));
		}

		this.logger.log('Донат-подписка отменена', {
			subscriptionId: subscription.subscriptionId,
			id: subscription.id
		});
		return { cancelled: true };
	}
}
