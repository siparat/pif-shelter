import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { campaigns } from '@pif/database';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { CampaignDeletedEvent } from '../../events/campaign-deleted/campaign-deleted.event';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { DeleteCampaignCommand } from './delete-campaign.command';
import { DeleteCampaignHandler } from './delete-campaign.handler';

describe('DeleteCampaignHandler', () => {
	let handler: DeleteCampaignHandler;
	let repository: DeepMocked<CampaignsRepository>;
	let eventBus: DeepMocked<EventBus>;

	const campaignId = randomUUID();
	const userId = randomUUID();
	const campaign = { id: campaignId, title: faker.word.words(3) } as unknown as typeof campaigns.$inferSelect;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				DeleteCampaignHandler,
				{ provide: CampaignsRepository, useValue: createMock<CampaignsRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(DeleteCampaignHandler);
		repository = module.get(CampaignsRepository);
		eventBus = module.get(EventBus);
	});

	it('deletes campaign and publishes CampaignDeletedEvent', async () => {
		repository.findById.mockResolvedValue(campaign);
		repository.delete.mockResolvedValue(true);

		await handler.execute(new DeleteCampaignCommand(campaignId, userId));

		expect(repository.findById).toHaveBeenCalledWith(campaignId);
		expect(repository.delete).toHaveBeenCalledWith(campaignId);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(CampaignDeletedEvent));
		expect((eventBus.publish as jest.Mock).mock.calls[0][0].campaignId).toBe(campaignId);
	});

	it('returns when campaign not found (idempotent)', async () => {
		repository.findById.mockResolvedValue(undefined);

		await handler.execute(new DeleteCampaignCommand(campaignId, userId));

		expect(repository.delete).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('returns when delete returns false', async () => {
		repository.findById.mockResolvedValue(campaign);
		repository.delete.mockResolvedValue(false);

		await handler.execute(new DeleteCampaignCommand(campaignId, userId));

		expect(repository.delete).toHaveBeenCalledWith(campaignId);
		expect(eventBus.publish).not.toHaveBeenCalled();
	});
});
