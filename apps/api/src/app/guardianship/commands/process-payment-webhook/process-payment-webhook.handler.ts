import { InternalServerErrorException, NotImplementedException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { guardianships } from '@pif/database';
import { PaymentService, PaymentWebhookEvent } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipActivatedEvent } from '../../events/guardianship-activated/guardianship-activated.event';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipNotFoundBySubscriptionException } from '../../exceptions/guardianship-not-found-by-subscription.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { computeNextPaidPeriodEnd, computeRenewalPaidPeriodEnd } from '../../utils/compute-next-paid-period-end';
import { resolveGuardianPrivilegesUntilForCancel } from '../../utils/resolve-guardian-privileges-until-for-cancel';
import { ProcessPaymentWebhookCommand } from './process-payment-webhook.command';
import { PaymentWebhookResponse } from '@pif/contracts';

const donationPaymentWebhookEvents = new Set<PaymentWebhookEvent>([
	PaymentWebhookEvent.PAYMENT_SUCCEEDED,
	PaymentWebhookEvent.PAYMENT_FAILED
]);

@CommandHandler(ProcessPaymentWebhookCommand)
export class ProcessPaymentWebhookHandler implements ICommandHandler<ProcessPaymentWebhookCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
		private readonly paymentService: PaymentService
	) {}

	async execute(command: ProcessPaymentWebhookCommand): Promise<PaymentWebhookResponse['data']> {
		const { subscriptionId, event } = command.payload;

		if (donationPaymentWebhookEvents.has(event)) {
			throw new NotImplementedException();
		}

		if (!subscriptionId) {
			throw new InternalServerErrorException();
		}

		const guardianship = await this.repository.findBySubscriptionId(subscriptionId);
		if (!guardianship) {
			throw new GuardianshipNotFoundBySubscriptionException();
		}

		switch (event) {
			case PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED: {
				const isActivated = await this.handleSubscriptionSucceeded(guardianship);
				return { guardianshipId: guardianship.id, activated: isActivated, handledBy: 'guardianship' };
			}
			case PaymentWebhookEvent.SUBSCRIPTION_FAILED: {
				const isCancelled = await this.handleSubscriptionFailed(guardianship);
				return { guardianshipId: guardianship.id, cancelled: isCancelled, handledBy: 'guardianship' };
			}
			case PaymentWebhookEvent.SUBSCRIPTION_CANCELED: {
				const isCancelled = await this.handleSubscriptionCanceled(guardianship);
				return { guardianshipId: guardianship.id, cancelled: isCancelled, handledBy: 'guardianship' };
			}
			default: {
				throw new InternalServerErrorException();
			}
		}
	}

	private async handleSubscriptionSucceeded(guardianship: typeof guardianships.$inferSelect): Promise<boolean> {
		const now = new Date();
		if (guardianship.status === GuardianshipStatusEnum.ACTIVE) {
			const paidPeriodEndAt = computeRenewalPaidPeriodEnd(guardianship, now);
			await this.repository.updatePaidPeriodEnd(guardianship.id, paidPeriodEndAt);
			this.logger.log('Продлён оплаченный период опекунства', {
				guardianshipId: guardianship.id,
				paidPeriodEndAt
			});
			return true;
		}

		if (guardianship.status === GuardianshipStatusEnum.PENDING_PAYMENT) {
			const paidPeriodEndAt = computeNextPaidPeriodEnd(now);
			await this.repository.activateWithPaidPeriodEnd(guardianship.id, paidPeriodEndAt);
			this.eventBus.publish(new GuardianshipActivatedEvent(guardianship));
			this.logger.log('Оплата подтверждена, опекунство оформлено', {
				guardianshipId: guardianship.id,
				subscriptionId: guardianship.subscriptionId,
				paidPeriodEndAt
			});
			return true;
		}

		this.logger.debug('Вебхук subscription.succeeded: статус не обрабатывается', {
			guardianshipId: guardianship.id,
			status: guardianship.status
		});
		return false;
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
		const guardianPrivilegesUntil = resolveGuardianPrivilegesUntilForCancel(guardianship, false);
		if (guardianPrivilegesUntil === null && guardianship.status === GuardianshipStatusEnum.ACTIVE) {
			this.logger.warn('Отмена по failed webhook ACTIVE без paid_period_end_at — портальный доступ не продлён', {
				guardianshipId: guardianship.id
			});
		}
		await this.repository.cancel(guardianship.id, new Date(), guardianPrivilegesUntil);
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

		const guardianPrivilegesUntil = resolveGuardianPrivilegesUntilForCancel(guardianship, false);
		if (guardianPrivilegesUntil === null && guardianship.status === GuardianshipStatusEnum.ACTIVE) {
			this.logger.warn(
				'Отмена по canceled webhook ACTIVE без paid_period_end_at — портальный доступ не продлён',
				{
					guardianshipId: guardianship.id
				}
			);
		}
		await this.repository.cancel(guardianship.id, new Date(), guardianPrivilegesUntil);
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
