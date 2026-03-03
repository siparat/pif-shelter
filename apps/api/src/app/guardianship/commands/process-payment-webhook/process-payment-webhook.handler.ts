import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { guardianships } from '@pif/database';
import { PaymentWebhookEvent } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipActivatedEvent } from '../../events/guardianship-activated/guardianship-activated.event';
import { GuardianshipNotFoundBySubscriptionException } from '../../exceptions/guardianship-not-found-by-subscription.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { ProcessPaymentWebhookCommand } from './process-payment-webhook.command';

@CommandHandler(ProcessPaymentWebhookCommand)
export class ProcessPaymentWebhookHandler implements ICommandHandler<ProcessPaymentWebhookCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute(command: ProcessPaymentWebhookCommand): Promise<{ guardianshipId: string; activated: boolean }> {
		const { subscriptionId, event } = command;

		const guardianship = await this.repository.findBySubscriptionId(subscriptionId);
		if (!guardianship) {
			throw new GuardianshipNotFoundBySubscriptionException();
		}

		switch (event) {
			case PaymentWebhookEvent.PAYMENT_SUCCEEDED: {
				const { isActivated } = await this.handlePaymentSucceeded(guardianship);
				return { activated: isActivated, guardianshipId: guardianship.id };
			}
		}
	}

	private async handlePaymentSucceeded(
		guardianship: typeof guardianships.$inferSelect
	): Promise<{ isActivated: boolean }> {
		if (guardianship.status === GuardianshipStatusEnum.ACTIVE) {
			this.logger.debug('Вебхук оплаты: опекунство уже активно', { guardianshipId: guardianship.id });
			return { isActivated: false };
		}

		await this.repository.activate(guardianship.id);
		this.eventBus.publish(new GuardianshipActivatedEvent(guardianship.id));
		this.logger.log('Опекунство активировано по вебхуку оплаты', {
			subscriptionId: guardianship.subscriptionId
		});
		return { isActivated: true };
	}
}
