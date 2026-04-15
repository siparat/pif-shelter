import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { PaymentWebhookPayload } from '@pif/contracts';
import { campaigns, donationOneTimeIntents } from '@pif/database';
import { PaymentWebhookEvent } from '@pif/shared';
import { CampaignStatus, DonationOneTimeIntentStatusEnum } from '@pif/shared';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { CampaignsService } from '../../../campaigns/campaigns.service';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { ProcessDonationWebhookOneTimeCommand } from './process-donation-webhook-one-time.command';
import { ProcessDonationWebhookOneTimeHandler } from './process-donation-webhook-one-time.handler';

describe('ProcessDonationWebhookOneTimeHandler', () => {
	let handler: ProcessDonationWebhookOneTimeHandler;
	let donationRepository: DeepMocked<DonationIntentsRepository>;
	let campaignsService: DeepMocked<CampaignsService>;
	let commandBus: DeepMocked<CommandBus>;

	const campaignId = randomUUID();
	const intent = {
		id: randomUUID(),
		transactionId: randomUUID(),
		campaignId,
		hidePublicName: false,
		displayName: faker.person.fullName()
	} as unknown as typeof donationOneTimeIntents.$inferSelect;

	const payload: PaymentWebhookPayload = {
		event: PaymentWebhookEvent.PAYMENT_SUCCEEDED,
		transactionId: intent.transactionId,
		providerPaymentId: randomUUID(),
		grossAmount: 10_000,
		feeAmount: 0,
		netAmount: 10_000,
		paidAt: new Date().toISOString()
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ProcessDonationWebhookOneTimeHandler,
				{ provide: DonationIntentsRepository, useValue: createMock<DonationIntentsRepository>() },
				{ provide: CampaignsService, useValue: createMock<CampaignsService>() },
				{ provide: CommandBus, useValue: createMock<CommandBus>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(ProcessDonationWebhookOneTimeHandler);
		donationRepository = module.get(DonationIntentsRepository);
		campaignsService = module.get(CampaignsService);
		commandBus = module.get(CommandBus);
	});

	it('does not apply donation when payment arrives after campaign end', async () => {
		donationRepository.findOneTimeByTransactionId.mockResolvedValue(intent);
		donationRepository.findOneTimeByProviderPaymentId.mockResolvedValue(undefined);
		donationRepository.updateOneTimeStatus.mockResolvedValue({
			...intent,
			status: DonationOneTimeIntentStatusEnum.SUCCEEDED
		} as typeof donationOneTimeIntents.$inferSelect);
		commandBus.execute.mockResolvedValue({ id: randomUUID() });
		campaignsService.findById.mockResolvedValue({
			id: campaignId,
			status: CampaignStatus.PUBLISHED,
			endsAt: new Date(Date.now() - 1_000)
		} as unknown as typeof campaigns.$inferSelect);

		await handler.execute(new ProcessDonationWebhookOneTimeCommand(payload));

		expect(campaignsService.updateStatus).not.toHaveBeenCalled();
		expect(campaignsService.applyDonation).not.toHaveBeenCalled();
	});

	it('applies donation to campaign when campaign is active', async () => {
		donationRepository.findOneTimeByTransactionId.mockResolvedValue(intent);
		donationRepository.findOneTimeByProviderPaymentId.mockResolvedValue(undefined);
		donationRepository.updateOneTimeStatus.mockResolvedValue({
			...intent,
			status: DonationOneTimeIntentStatusEnum.SUCCEEDED
		} as typeof donationOneTimeIntents.$inferSelect);
		commandBus.execute.mockResolvedValue({ id: randomUUID() });
		campaignsService.findById.mockResolvedValue({
			id: campaignId,
			status: CampaignStatus.PUBLISHED,
			endsAt: new Date(Date.now() + 60_000)
		} as unknown as typeof campaigns.$inferSelect);
		campaignsService.applyDonation.mockResolvedValue({
			id: campaignId,
			status: CampaignStatus.SUCCESS
		} as unknown as typeof campaigns.$inferSelect);

		await handler.execute(new ProcessDonationWebhookOneTimeCommand(payload));

		expect(campaignsService.applyDonation).toHaveBeenCalledWith(campaignId, payload.netAmount);
	});
});
