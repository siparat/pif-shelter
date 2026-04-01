import { InternalServerErrorException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentWebhookEvent } from '@pif/payment';
import { CampaignStatus, DonationOneTimeIntentStatusEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { CampaignsService } from '../../../campaigns/campaigns.service';
import { RecordLedgerIncomeCommand } from '../../../finance/commands/record-ledger-income/record-ledger-income.command';
import { DonationPaymentSucceededEvent } from '../../events/donation-payment-succeeded/donation-payment-succeeded.event';
import { DonationIntentNotFoundException } from '../../exceptions/donation-intent-not-found.exception';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { ProcessDonationWebhookOneTimeCommand } from './process-donation-webhook-one-time.command';
import { PaymentWebhookResponse } from '@pif/contracts';

@CommandHandler(ProcessDonationWebhookOneTimeCommand)
export class ProcessDonationWebhookOneTimeHandler implements ICommandHandler<ProcessDonationWebhookOneTimeCommand> {
	private readonly handlerName = 'donation_one_time';

	constructor(
		private readonly repository: DonationIntentsRepository,
		private readonly campaignsService: CampaignsService,
		private readonly commandBus: CommandBus,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ payload }: ProcessDonationWebhookOneTimeCommand): Promise<PaymentWebhookResponse['data']> {
		if (!payload.transactionId) {
			throw new InternalServerErrorException();
		}
		const transactionId = payload.transactionId;
		const intent = await this.repository.findOneTimeByTransactionId(transactionId);
		if (!intent) {
			throw new DonationIntentNotFoundException(transactionId);
		}

		if (payload.event === PaymentWebhookEvent.PAYMENT_FAILED) {
			await this.repository.updateOneTimeStatus(intent.id, DonationOneTimeIntentStatusEnum.FAILED);
			this.logger.log('Разовый донат помечен как FAILED', { intentId: intent.id, transactionId });
			return { donationOneTimeIntentId: intent.id, handledBy: this.handlerName };
		}

		if (
			!payload.providerPaymentId ||
			payload.grossAmount === undefined ||
			payload.feeAmount === undefined ||
			payload.netAmount === undefined ||
			!payload.paidAt
		) {
			throw new InternalServerErrorException();
		}
		const providerPaymentId = payload.providerPaymentId;
		const duplicate = await this.repository.findOneTimeByProviderPaymentId(providerPaymentId);
		if (duplicate) {
			this.logger.warn('Повторный webhook разового доната с тем же providerPaymentId', {
				intentId: duplicate.id,
				providerPaymentId
			});
			return { donationOneTimeIntentId: duplicate.id, handledBy: this.handlerName };
		}

		await this.repository.updateOneTimeStatus(
			intent.id,
			DonationOneTimeIntentStatusEnum.SUCCEEDED,
			providerPaymentId
		);
		const income = await this.commandBus.execute(
			new RecordLedgerIncomeCommand({
				source: LedgerEntrySourceEnum.DONATION_ONE_OFF,
				grossAmount: payload.grossAmount,
				feeAmount: payload.feeAmount,
				netAmount: payload.netAmount,
				occurredAt: new Date(payload.paidAt),
				title: 'Пожертвование',
				providerPaymentId,
				donorDisplayName: intent.hidePublicName ? null : intent.displayName,
				donationOneTimeIntentId: intent.id
			})
		);

		if (intent.campaignId) {
			const campaign = await this.campaignsService.findById(intent.campaignId);
			if (campaign && campaign.endsAt.getTime() > Date.now()) {
				const updatedCampaign = await this.campaignsService.applyDonation(campaign.id, payload.netAmount);
				if (updatedCampaign?.status === CampaignStatus.SUCCESS) {
					this.logger.log('Сбор закрыт как SUCCESS после пополнения', {
						campaignId: updatedCampaign.id,
						collected: updatedCampaign.collected,
						goal: updatedCampaign.goal
					});
				}
			}
		}

		this.eventBus.publish(new DonationPaymentSucceededEvent(intent, providerPaymentId));
		this.logger.log('Разовый донат обработан и записан в ledger', {
			intentId: intent.id,
			ledgerEntryId: income.id
		});

		return { donationOneTimeIntentId: intent.id, ledgerEntryId: income.id, handledBy: this.handlerName };
	}
}
