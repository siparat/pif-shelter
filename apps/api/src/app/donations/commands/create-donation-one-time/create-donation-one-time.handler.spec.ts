import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BadRequestException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { CreateOneTimeDonationRequestDto } from '@pif/contracts';
import { campaigns, donationOneTimeIntents } from '@pif/database';
import { PaymentService } from '@pif/payment';
import { CampaignStatus } from '@pif/shared';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { CampaignsService } from '../../../campaigns/campaigns.service';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { CreateDonationOneTimeCommand } from './create-donation-one-time.command';
import { CreateDonationOneTimeHandler } from './create-donation-one-time.handler';

describe('CreateDonationOneTimeHandler', () => {
	let handler: CreateDonationOneTimeHandler;
	let donationRepository: DeepMocked<DonationIntentsRepository>;
	let campaignsService: DeepMocked<CampaignsService>;
	let paymentService: DeepMocked<PaymentService>;

	const campaignId = randomUUID();
	const dto: CreateOneTimeDonationRequestDto = {
		displayName: faker.person.fullName(),
		hidePublicName: false,
		amount: 10_000,
		campaignId
	};

	const campaign = {
		id: campaignId,
		status: CampaignStatus.PUBLISHED,
		collected: 0,
		goal: 100_000,
		endsAt: new Date(Date.now() + 60_000)
	} as unknown as typeof campaigns.$inferSelect;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				CreateDonationOneTimeHandler,
				{ provide: DonationIntentsRepository, useValue: createMock<DonationIntentsRepository>() },
				{ provide: CampaignsService, useValue: createMock<CampaignsService>() },
				{ provide: PaymentService, useValue: createMock<PaymentService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(CreateDonationOneTimeHandler);
		donationRepository = module.get(DonationIntentsRepository);
		campaignsService = module.get(CampaignsService);
		paymentService = module.get(PaymentService);
	});

	it('throws when campaign is expired', async () => {
		campaignsService.findById.mockResolvedValue({
			...campaign,
			endsAt: new Date(Date.now() - 1_000)
		} as typeof campaigns.$inferSelect);

		await expect(handler.execute(new CreateDonationOneTimeCommand(dto))).rejects.toThrow(BadRequestException);
		expect(campaignsService.updateStatus).not.toHaveBeenCalled();
		expect(donationRepository.createOneTimePending).not.toHaveBeenCalled();
	});

	it('throws when campaign goal is reached', async () => {
		campaignsService.findById.mockResolvedValue({
			...campaign,
			collected: 100_000
		} as typeof campaigns.$inferSelect);

		await expect(handler.execute(new CreateDonationOneTimeCommand(dto))).rejects.toThrow(BadRequestException);
		expect(campaignsService.updateStatus).not.toHaveBeenCalled();
		expect(donationRepository.createOneTimePending).not.toHaveBeenCalled();
	});

	it('creates one-time intent with campaignId when campaign is available', async () => {
		const intent = {
			id: randomUUID(),
			transactionId: randomUUID()
		} as unknown as typeof donationOneTimeIntents.$inferSelect;
		campaignsService.findById.mockResolvedValue(campaign);
		donationRepository.createOneTimePending.mockResolvedValue(intent);
		paymentService.generateDonationOneTimeLink.mockResolvedValue({ url: faker.internet.url(), amount: dto.amount });

		await handler.execute(new CreateDonationOneTimeCommand(dto));

		expect(donationRepository.createOneTimePending).toHaveBeenCalledWith(
			expect.objectContaining({ campaignId, expectedAmount: dto.amount })
		);
	});
});
