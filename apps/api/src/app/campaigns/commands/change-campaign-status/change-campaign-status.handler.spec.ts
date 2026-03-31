import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { campaigns } from '@pif/database';
import { CampaignStatus } from '@pif/shared';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { CampaignUpdatedEvent } from '../../events/campaign-updated/campaign-updated.event';
import { CampaignNotFoundException } from '../../exceptions/campaign-not-found.exception';
import { InvalidCampaignStatusTransitionException } from '../../exceptions/invalid-campaign-status-transition.exception';
import { CanCreateCampaignPolicy } from '../../policies/can-create-campaign.policy';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { ChangeCampaignStatusCommand } from './change-campaign-status.command';
import { ChangeCampaignStatusHandler } from './change-campaign-status.handler';

describe('ChangeCampaignStatusHandler', () => {
	let handler: ChangeCampaignStatusHandler;
	let repository: DeepMocked<CampaignsRepository>;
	let policy: DeepMocked<CanCreateCampaignPolicy>;
	let eventBus: DeepMocked<EventBus>;

	const campaign = {
		id: randomUUID(),
		title: faker.word.words(3),
		status: CampaignStatus.DRAFT
	} as unknown as typeof campaigns.$inferSelect;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ChangeCampaignStatusHandler,
				{ provide: CampaignsRepository, useValue: createMock<CampaignsRepository>() },
				{ provide: CanCreateCampaignPolicy, useValue: createMock<CanCreateCampaignPolicy>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(ChangeCampaignStatusHandler);
		repository = module.get(CampaignsRepository);
		policy = module.get(CanCreateCampaignPolicy);
		eventBus = module.get(EventBus);
	});

	it('throws when campaign is not found', async () => {
		repository.findById.mockResolvedValue(undefined);

		await expect(
			handler.execute(new ChangeCampaignStatusCommand(randomUUID(), CampaignStatus.PUBLISHED, randomUUID()))
		).rejects.toThrow(CampaignNotFoundException);
		expect(repository.updateStatus).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when status transition is invalid', async () => {
		repository.findById.mockResolvedValue(campaign);
		policy.assertCanChangeStatus.mockImplementation(() => {
			throw new InvalidCampaignStatusTransitionException(CampaignStatus.DRAFT, CampaignStatus.SUCCESS);
		});

		await expect(
			handler.execute(new ChangeCampaignStatusCommand(campaign.id, CampaignStatus.SUCCESS, randomUUID()))
		).rejects.toThrow(InvalidCampaignStatusTransitionException);
		expect(repository.updateStatus).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('updates status and publishes event', async () => {
		repository.findById.mockResolvedValue(campaign);
		policy.assertCanChangeStatus.mockReturnValue(undefined);
		repository.updateStatus.mockResolvedValue({
			...campaign,
			status: CampaignStatus.PUBLISHED
		} as typeof campaigns.$inferSelect);

		const result = await handler.execute(
			new ChangeCampaignStatusCommand(campaign.id, CampaignStatus.PUBLISHED, randomUUID())
		);

		expect(result).toStrictEqual({ id: campaign.id });
		expect(policy.assertCanChangeStatus).toHaveBeenCalledWith(campaign, CampaignStatus.PUBLISHED);
		expect(repository.updateStatus).toHaveBeenCalledWith(campaign.id, CampaignStatus.PUBLISHED);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(CampaignUpdatedEvent));
	});
});
