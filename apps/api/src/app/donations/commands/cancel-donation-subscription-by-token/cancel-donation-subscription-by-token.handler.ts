import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { DonationSubscriptionStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PaymentServiceUnavailableException } from '../../../guardianship/exceptions/payment-service-unavailable.exception';
import { DonationSubscriptionCancelledEvent } from '../../events/donation-subscription-cancelled/donation-subscription-cancelled.event';
import { DonationSubscriptionNotFoundByCancellationTokenException } from '../../exceptions/donation-subscription-not-found-by-cancellation-token.exception';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { CancelDonationSubscriptionByTokenCommand } from './cancel-donation-subscription-by-token.command';

@CommandHandler(CancelDonationSubscriptionByTokenCommand)
export class CancelDonationSubscriptionByTokenHandler
	implements ICommandHandler<CancelDonationSubscriptionByTokenCommand>
{
	constructor(
		private readonly repository: DonationIntentsRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ token }: CancelDonationSubscriptionByTokenCommand): Promise<{ subscriptionId: string }> {
		const subscription = await this.repository.findSubscriptionByCancellationToken(token);
		if (!subscription) {
			throw new DonationSubscriptionNotFoundByCancellationTokenException();
		}

		if (
			[DonationSubscriptionStatusEnum.CANCELLED, DonationSubscriptionStatusEnum.FAILED].includes(
				subscription.status
			)
		) {
			await this.repository.clearSubscriptionCancellationToken(subscription.id);
			return { subscriptionId: subscription.subscriptionId };
		}

		const isSuccess = await this.paymentService.cancelSubscription(subscription.subscriptionId);
		if (!isSuccess) {
			throw new PaymentServiceUnavailableException();
		}

		const updated = await this.repository.markSubscriptionCancelled(subscription.id, new Date());
		if (updated) {
			this.eventBus.publish(new DonationSubscriptionCancelledEvent(updated));
		}

		this.logger.log('Донат-подписка отменена по токену', {
			subscriptionId: subscription.subscriptionId,
			id: subscription.id,
			token
		});

		return { subscriptionId: subscription.subscriptionId };
	}
}
