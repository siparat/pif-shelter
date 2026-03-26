import { InternalServerErrorException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentWebhookEvent } from '@pif/payment';
import { DonationSubscriptionStatusEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { RecordLedgerIncomeCommand } from '../../../finance/commands/record-ledger-income/record-ledger-income.command';
import { DonationPaymentSucceededEvent } from '../../events/donation-payment-succeeded/donation-payment-succeeded.event';
import { DonationSubscriptionCancelledEvent } from '../../events/donation-subscription-cancelled/donation-subscription-cancelled.event';
import { DonationSubscriptionNotFoundException } from '../../exceptions/donation-subscription-not-found.exception';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { ProcessDonationWebhookSubscriptionCommand } from './process-donation-webhook-subscription.command';
import { PaymentWebhookResponse } from '@pif/contracts';

@CommandHandler(ProcessDonationWebhookSubscriptionCommand)
export class ProcessDonationWebhookSubscriptionHandler
	implements ICommandHandler<ProcessDonationWebhookSubscriptionCommand>
{
	private readonly handlerName = 'donation_subscription';

	constructor(
		private readonly repository: DonationIntentsRepository,
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ payload }: ProcessDonationWebhookSubscriptionCommand): Promise<PaymentWebhookResponse['data']> {
		if (!payload.subscriptionId) {
			throw new InternalServerErrorException();
		}
		const subscriptionId = payload.subscriptionId;
		const subscription = await this.repository.findSubscriptionBySubscriptionId(subscriptionId);
		if (!subscription) {
			throw new DonationSubscriptionNotFoundException(subscriptionId);
		}

		if (
			payload.event === PaymentWebhookEvent.SUBSCRIPTION_FAILED ||
			payload.event === PaymentWebhookEvent.SUBSCRIPTION_CANCELED
		) {
			if (payload.event === PaymentWebhookEvent.SUBSCRIPTION_FAILED) {
				await this.repository.updateSubscriptionStatus(subscription.id, DonationSubscriptionStatusEnum.FAILED);
				this.logger.log('Донат-подписка обновлена по failed webhook', {
					subscriptionId,
					event: payload.event
				});
				return { donationSubscriptionId: subscription.id, handledBy: this.handlerName };
			}

			if (payload.event === PaymentWebhookEvent.SUBSCRIPTION_CANCELED) {
				const updated = await this.repository.markSubscriptionCancelled(subscription.id, new Date());
				if (updated) {
					this.eventBus.publish(new DonationSubscriptionCancelledEvent(updated));
				}
				this.logger.log('Донат-подписка обновлена по canceled webhook', {
					subscriptionId,
					event: payload.event
				});
				return { donationSubscriptionId: subscription.id, handledBy: this.handlerName };
			}
		}

		if (subscription.status === DonationSubscriptionStatusEnum.PENDING_FIRST_PAYMENT) {
			await this.repository.updateSubscriptionStatus(subscription.id, DonationSubscriptionStatusEnum.ACTIVE);
		}
		if (
			payload.grossAmount === undefined ||
			payload.feeAmount === undefined ||
			payload.netAmount === undefined ||
			!payload.paidAt ||
			!payload.providerPaymentId
		) {
			throw new InternalServerErrorException();
		}

		const income = await this.commandBus.execute(
			new RecordLedgerIncomeCommand({
				source: LedgerEntrySourceEnum.DONATION_SUBSCRIPTION,
				grossAmount: payload.grossAmount,
				feeAmount: payload.feeAmount,
				netAmount: payload.netAmount,
				occurredAt: new Date(payload.paidAt),
				title: 'Подписка на пожертвование',
				providerPaymentId: payload.providerPaymentId,
				donorDisplayName: subscription.hidePublicName ? null : subscription.displayName,
				donationSubscriptionId: subscription.id
			})
		);

		this.eventBus.publish(new DonationPaymentSucceededEvent(subscription, payload.providerPaymentId));
		this.logger.log('Платеж по донат-подписке обработан', {
			subscriptionId,
			ledgerEntryId: income.id
		});

		return {
			donationSubscriptionId: subscription.id,
			ledgerEntryId: income.id,
			handledBy: this.handlerName
		};
	}
}
