import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { CampaignStatus } from '@pif/shared';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { CampaignsService } from '../../../campaigns/campaigns.service';
import { DonationOneTimeInitiatedEvent } from '../../events/donation-one-time-initiated/donation-one-time-initiated.event';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { CreateDonationOneTimeCommand } from './create-donation-one-time.command';
import { BadRequestException } from '@nestjs/common';

@CommandHandler(CreateDonationOneTimeCommand)
export class CreateDonationOneTimeHandler implements ICommandHandler<CreateDonationOneTimeCommand> {
	constructor(
		private readonly repository: DonationIntentsRepository,
		private readonly campaignsService: CampaignsService,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto }: CreateDonationOneTimeCommand): Promise<{ paymentUrl: string; transactionId: string }> {
		if (dto.campaignId) {
			const campaign = await this.campaignsService.findById(dto.campaignId);
			if (!campaign) {
				throw new BadRequestException('Сбор не найден');
			}
			const now = Date.now();
			if (campaign.endsAt.getTime() <= now) {
				await this.campaignsService.updateStatus(campaign.id, CampaignStatus.FAILED);
				throw new BadRequestException('Сбор завершен по времени');
			}
			if (campaign.status === CampaignStatus.DRAFT) {
				throw new BadRequestException('Сбор еще не опубликован');
			}
			if (campaign.status === CampaignStatus.CANCELLED || campaign.status === CampaignStatus.FAILED) {
				throw new BadRequestException('Сбор закрыт');
			}
			if (campaign.goal > 0 && campaign.collected >= campaign.goal) {
				await this.campaignsService.updateStatus(campaign.id, CampaignStatus.SUCCESS);
				throw new BadRequestException('Цель сбора уже достигнута');
			}
			if (campaign.status === CampaignStatus.SUCCESS) {
				throw new BadRequestException('Цель сбора уже достигнута');
			}
		}

		const transactionId = randomUUID();
		const intent = await this.repository.createOneTimePending({
			transactionId,
			displayName: dto.displayName,
			hidePublicName: dto.hidePublicName,
			expectedAmount: dto.amount,
			campaignId: dto.campaignId
		});
		const payment = await this.paymentService.generateDonationOneTimeLink({
			transactionId,
			amount: dto.amount
		});

		this.eventBus.publish(new DonationOneTimeInitiatedEvent(intent));
		this.logger.log('Создано намерение разового доната', {
			transactionId: intent.transactionId,
			intentId: intent.id
		});

		return { paymentUrl: payment.url, transactionId };
	}
}
