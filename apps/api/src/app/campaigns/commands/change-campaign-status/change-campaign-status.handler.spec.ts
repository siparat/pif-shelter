import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { campaigns } from '@pif/database';
import { CampaignStatus } from '@pif/shared';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { CampaignUpdatedEvent } from '../../events/campaign-updated/campaign-updated.event';
import { AbsentPreviewImage } from '../../exceptions/absent-preview-image.exception';
import { CampaignNotFoundException } from '../../exceptions/campaign-not-found.exception';
import { InvalidCampaignStatusTransitionException } from '../../exceptions/invalid-campaign-status-transition.exception';
import { CanCreateCampaignPolicy } from '../../policies/can-create-campaign.policy';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { ChangeCampaignStatusCommand } from './change-campaign-status.command';
import { ChangeCampaignStatusHandler } from './change-campaign-status.handler';
import { BadRequestException } from '@nestjs/common';

describe('ChangeCampaignStatusHandler', () => {
	let handler: ChangeCampaignStatusHandler;
	let repository: DeepMocked<CampaignsRepository>;
	let policy: DeepMocked<CanCreateCampaignPolicy>;
	let storagePolicy: DeepMocked<FileStoragePolicy>;
	let eventBus: DeepMocked<EventBus>;

	const campaign = {
		id: randomUUID(),
		title: faker.word.words(3),
		status: CampaignStatus.DRAFT,
		previewImage: `/campaigns/${randomUUID()}.png`
	} as unknown as typeof campaigns.$inferSelect;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				ChangeCampaignStatusHandler,
				{ provide: CampaignsRepository, useValue: createMock<CampaignsRepository>() },
				{ provide: CanCreateCampaignPolicy, useValue: createMock<CanCreateCampaignPolicy>() },
				{ provide: FileStoragePolicy, useValue: createMock<FileStoragePolicy>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(ChangeCampaignStatusHandler);
		repository = module.get(CampaignsRepository);
		policy = module.get(CanCreateCampaignPolicy);
		storagePolicy = module.get(FileStoragePolicy);
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

	it('throws when preview image is absent', async () => {
		const campaignWithoutImage = { ...campaign, previewImage: null };
		repository.findById.mockResolvedValue(campaignWithoutImage);
		policy.assertCanChangeStatus.mockReturnValue(undefined);

		await expect(
			handler.execute(
				new ChangeCampaignStatusCommand(campaignWithoutImage.id, CampaignStatus.PUBLISHED, randomUUID())
			)
		).rejects.toThrow(AbsentPreviewImage);
		expect(repository.updateStatus).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when preview image is not found in storage', async () => {
		repository.findById.mockResolvedValue(campaign);
		policy.assertCanChangeStatus.mockReturnValue(undefined);
		storagePolicy.assertExists.mockRejectedValue(new BadRequestException('Изображение не найдено'));

		await expect(
			handler.execute(new ChangeCampaignStatusCommand(campaign.id, CampaignStatus.PUBLISHED, randomUUID()))
		).rejects.toThrow(BadRequestException);
		expect(storagePolicy.assertExists).toHaveBeenCalledWith(campaign.previewImage);
		expect(repository.updateStatus).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('updates status and publishes event', async () => {
		repository.findById.mockResolvedValue(campaign);
		policy.assertCanChangeStatus.mockReturnValue(undefined);
		storagePolicy.assertExists.mockResolvedValue(undefined);
		repository.updateStatus.mockResolvedValue({
			...campaign,
			status: CampaignStatus.PUBLISHED
		} as typeof campaigns.$inferSelect);

		const result = await handler.execute(
			new ChangeCampaignStatusCommand(campaign.id, CampaignStatus.PUBLISHED, randomUUID())
		);

		expect(result).toStrictEqual({ id: campaign.id });
		expect(policy.assertCanChangeStatus).toHaveBeenCalledWith(campaign, CampaignStatus.PUBLISHED);
		expect(storagePolicy.assertExists).toHaveBeenCalledWith(campaign.previewImage);
		expect(repository.updateStatus).toHaveBeenCalledWith(campaign.id, CampaignStatus.PUBLISHED);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(CampaignUpdatedEvent));
	});
});
