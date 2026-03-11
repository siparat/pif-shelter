import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { guardianships } from '@pif/database';
import { PaymentService, PaymentWebhookEvent } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipActivatedEvent } from '../../events/guardianship-activated/guardianship-activated.event';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipNotFoundBySubscriptionException } from '../../exceptions/guardianship-not-found-by-subscription.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { ProcessPaymentWebhookCommand, ProcessPaymentWebhookResult } from './process-payment-webhook.command';

@CommandHandler(ProcessPaymentWebhookCommand)
export class ProcessPaymentWebhookHandler implements ICommandHandler<ProcessPaymentWebhookCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
		private readonly paymentService: PaymentService
	) {}

	async execute(command: ProcessPaymentWebhookCommand): Promise<ProcessPaymentWebhookResult> {
		const { subscriptionId, event } = command;

		const guardianship = await this.repository.findBySubscriptionId(subscriptionId);
		if (!guardianship) {
			throw new GuardianshipNotFoundBySubscriptionException();
		}

		switch (event) {
			case PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED: {
				const isActivated = await this.handleSubscriptionSucceeded(guardianship);
				return { guardianshipId: guardianship.id, activated: isActivated };
			}
			case PaymentWebhookEvent.SUBSCRIPTION_FAILED: {
				const isCancelled = await this.handleSubscriptionFailed(guardianship);
				return { guardianshipId: guardianship.id, cancelled: isCancelled };
			}
			case PaymentWebhookEvent.SUBSCRIPTION_CANCELED: {
				const isCancelled = await this.handleSubscriptionCanceled(guardianship);
				return { guardianshipId: guardianship.id, cancelled: isCancelled };
			}
			default: {
				const exhaustive: never = event;
				throw new Error(`Неизвестный тип вебхука: ${exhaustive}`);
			}
		}
	}

	private async handleSubscriptionSucceeded(guardianship: typeof guardianships.$inferSelect): Promise<boolean> {
		if (guardianship.status === GuardianshipStatusEnum.ACTIVE) {
			this.logger.debug('Вебхук subscription.succeeded: опекунство уже активно', {
				guardianshipId: guardianship.id
			});
			return false;
		}

		await this.repository.activate(guardianship.id);
		this.eventBus.publish(new GuardianshipActivatedEvent(guardianship));
		this.logger.log('Оплата подтверждена, опекунство оформлено', {
			guardianshipId: guardianship.id,
			subscriptionId: guardianship.subscriptionId
		});
		return true;
	}

	private async handleSubscriptionFailed(guardianship: typeof guardianships.$inferSelect): Promise<boolean> {
		if (guardianship.status === GuardianshipStatusEnum.CANCELLED) {
			this.logger.debug('Вебхук subscription.failed: опекунство уже отменено', {
				guardianshipId: guardianship.id,
				status: guardianship.status
			});
			return false;
		}

		// При первой просрочке по оплате отменяем подписку
		await this.paymentService.cancelSubscription(guardianship.subscriptionId);
		await this.repository.cancel(guardianship.id, new Date());
		this.logger.log('Просрочен платеж по опекунству, отмена подписки', {
			guardianshipId: guardianship.id,
			subscriptionId: guardianship.subscriptionId
		});

		this.eventBus.publish(new GuardianshipCancelledEvent(guardianship, false, 'Платёж не прошёл'));

		return true;
	}

	private async handleSubscriptionCanceled(guardianship: typeof guardianships.$inferSelect): Promise<boolean> {
		if (guardianship.status === GuardianshipStatusEnum.CANCELLED) {
			this.logger.debug('Вебхук subscription.canceled: опекунство уже отменено', {
				guardianshipId: guardianship.id
			});
			return false;
		}

		await this.repository.cancel(guardianship.id, new Date());
		this.eventBus.publish(
			new GuardianshipCancelledEvent(guardianship, false, 'Отмена в платежном сервисе вами или сервисом')
		);
		this.logger.log('Опекунство отменено в платежном сервисе', {
			guardianshipId: guardianship.id,
			subscriptionId: guardianship.subscriptionId
		});
		return true;
	}
}
