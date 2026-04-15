import { InternalServerErrorException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import type { PaymentWebhookPayload, PaymentWebhookResponse } from '@pif/contracts';
import { guardianships } from '@pif/database';
import {
	GUARDIANSHIP_LEDGER_INCOME_TITLE_PREFIX,
	GuardianshipStatusEnum,
	LedgerEntrySourceEnum,
	PaymentWebhookEvent
} from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { ProcessDonationWebhookSubscriptionCommand } from '../../../donations/commands/process-donation-webhook-subscription/process-donation-webhook-subscription.command';
import { RecordLedgerIncomeCommand } from '../../../finance/commands/record-ledger-income/record-ledger-income.command';
import { DuplicateProviderPaymentException } from '../../../finance/exceptions/duplicate-provider-payment.exception';
import { LedgerRepository } from '../../../finance/repositories/ledger.repository';
import { GuardianshipActivatedEvent } from '../../events/guardianship-activated/guardianship-activated.event';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipNotFoundBySubscriptionException } from '../../exceptions/guardianship-not-found-by-subscription.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { computeNextPaidPeriodEnd, computeRenewalPaidPeriodEnd } from '../../utils/compute-next-paid-period-end';
import { resolveGuardianPrivilegesUntilForCancel } from '../../utils/resolve-guardian-privileges-until-for-cancel';
import { ProcessPaymentWebhookCommand } from './process-payment-webhook.command';
import { PaymentService } from '@pif/payment';

@CommandHandler(ProcessPaymentWebhookCommand)
export class ProcessPaymentWebhookHandler implements ICommandHandler<ProcessPaymentWebhookCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly ledgerRepository: LedgerRepository,
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
		private readonly logger: Logger,
		private readonly paymentService: PaymentService
	) {}

	async execute(command: ProcessPaymentWebhookCommand): Promise<PaymentWebhookResponse['data']> {
		const { subscriptionId, event } = command.payload;

		if (!subscriptionId) {
			throw new InternalServerErrorException();
		}

		const guardianship = await this.repository.findBySubscriptionId(subscriptionId);
		if (!guardianship) {
			if (
				event === PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED ||
				event === PaymentWebhookEvent.SUBSCRIPTION_FAILED
			) {
				return this.commandBus.execute(new ProcessDonationWebhookSubscriptionCommand(command.payload));
			}
			throw new GuardianshipNotFoundBySubscriptionException();
		}

		switch (event) {
			case PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED: {
				return this.handleSubscriptionSucceededWithLedger(guardianship, command.payload);
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

	private async handleSubscriptionSucceededWithLedger(
		guardianship: typeof guardianships.$inferSelect,
		payload: PaymentWebhookPayload
	): Promise<PaymentWebhookResponse['data']> {
		const providerPaymentId = payload.providerPaymentId;
		if (providerPaymentId) {
			const existingEntry = await this.ledgerRepository.findByProviderPaymentId(providerPaymentId);
			if (existingEntry) {
				if (existingEntry.guardianshipId !== guardianship.id) {
					this.logger.error('providerPaymentId уже используется другой проводкой', {
						guardianshipId: guardianship.id,
						providerPaymentId,
						existingLedgerEntryId: existingEntry.id
					});
					throw new InternalServerErrorException();
				}
				this.logger.warn('Повторный вебхук опеки, проводка уже в ledger', {
					guardianshipId: guardianship.id,
					providerPaymentId
				});
				return {
					guardianshipId: guardianship.id,
					activated: true,
					handledBy: 'guardianship',
					ledgerEntryId: existingEntry.id
				};
			}
		}

		const isActivated = await this.handleSubscriptionSucceeded(guardianship);
		const result: PaymentWebhookResponse['data'] = {
			guardianshipId: guardianship.id,
			activated: isActivated,
			handledBy: 'guardianship'
		};

		if (!isActivated) {
			return result;
		}

		const ledgerEntryId = await this.recordGuardianshipLedgerIncome(guardianship.id, payload);
		if (ledgerEntryId) {
			result.ledgerEntryId = ledgerEntryId;
		}
		return result;
	}

	private async recordGuardianshipLedgerIncome(
		guardianshipId: string,
		payload: PaymentWebhookPayload
	): Promise<string | undefined> {
		const providerPaymentId = payload.providerPaymentId;
		const grossAmount = payload.grossAmount;
		const feeAmount = payload.feeAmount;
		const netAmount = payload.netAmount;
		const paidAt = payload.paidAt;
		if (
			!providerPaymentId ||
			grossAmount === undefined ||
			feeAmount === undefined ||
			netAmount === undefined ||
			!paidAt
		) {
			this.logger.error('Вебхук опеки: нет данных для записи в ledger после успешной оплаты', {
				guardianshipId
			});
			return undefined;
		}

		const labels = await this.repository.findLedgerLabelsByGuardianshipId(guardianshipId);
		const title = `${GUARDIANSHIP_LEDGER_INCOME_TITLE_PREFIX} ${labels?.animalName ?? '—'}`;

		try {
			const { id } = await this.commandBus.execute(
				new RecordLedgerIncomeCommand({
					source: LedgerEntrySourceEnum.GUARDIANSHIP,
					grossAmount,
					feeAmount,
					netAmount,
					occurredAt: new Date(paidAt),
					title,
					providerPaymentId,
					donorDisplayName: labels?.guardianDisplayName ?? null,
					guardianshipId
				})
			);
			return id;
		} catch (err) {
			if (err instanceof DuplicateProviderPaymentException) {
				this.logger.warn('Дубликат providerPaymentId при записи опеки в ledger', {
					guardianshipId,
					providerPaymentId
				});
				return undefined;
			}
			throw err;
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
