import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BadRequestException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { UpdateCampaignRequestDto } from '@pif/contracts';
import { campaigns } from '@pif/database';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { CampaignUpdatedEvent } from '../../events/campaign-updated/campaign-updated.event';
import { CampaignNotFoundException } from '../../exceptions/campaign-not-found.exception';
import { CanCreateCampaignPolicy } from '../../policies/can-create-campaign.policy';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { UpdateCampaignCommand } from './update-campaign.command';
import { UpdateCampaignHandler } from './update-campaign.handler';

describe('UpdateCampaignHandler', () => {
	let handler: UpdateCampaignHandler;
	let repository: DeepMocked<CampaignsRepository>;
	let policy: DeepMocked<CanCreateCampaignPolicy>;
	let storagePolicy: DeepMocked<FileStoragePolicy>;
	let eventBus: DeepMocked<EventBus>;

	const campaign = {
		id: randomUUID(),
		title: faker.word.words(3),
		goal: faker.number.int({ min: 1_000, max: 10_000 }),
		endsAt: faker.date.future(),
		startsAt: faker.date.recent(),
		animalId: null
	} as unknown as typeof campaigns.$inferSelect;

	const dto: UpdateCampaignRequestDto = {
		title: faker.word.words(5),
		endsAt: faker.date.future().toISOString(),
		previewImage: `campaigns/${randomUUID()}.png`
	};

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				UpdateCampaignHandler,
				{ provide: CampaignsRepository, useValue: createMock<CampaignsRepository>() },
				{ provide: CanCreateCampaignPolicy, useValue: createMock<CanCreateCampaignPolicy>() },
				{ provide: FileStoragePolicy, useValue: createMock<FileStoragePolicy>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(UpdateCampaignHandler);
		repository = module.get(CampaignsRepository);
		policy = module.get(CanCreateCampaignPolicy);
		storagePolicy = module.get(FileStoragePolicy);
		eventBus = module.get(EventBus);
	});

	it('throws when campaign is not found', async () => {
		repository.findById.mockResolvedValue(undefined);

		await expect(handler.execute(new UpdateCampaignCommand(campaign.id, dto, randomUUID()))).rejects.toThrow(
			CampaignNotFoundException
		);
		expect(repository.update).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when storage policy throws', async () => {
		repository.findById.mockResolvedValue(campaign);
		policy.assertCanUpdate.mockResolvedValue(undefined);
		storagePolicy.assertExists.mockRejectedValue(new BadRequestException('Изображение не найдено'));

		await expect(handler.execute(new UpdateCampaignCommand(campaign.id, dto, randomUUID()))).rejects.toThrow(
			BadRequestException
		);
		expect(repository.update).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('updates campaign and publishes CampaignUpdatedEvent', async () => {
		repository.findById.mockResolvedValue(campaign);
		policy.assertCanUpdate.mockResolvedValue(undefined);
		storagePolicy.assertExists.mockResolvedValue(undefined);
		repository.update.mockResolvedValue({ ...campaign, title: dto.title } as typeof campaigns.$inferSelect);

		const result = await handler.execute(new UpdateCampaignCommand(campaign.id, dto, randomUUID()));

		expect(result).toStrictEqual({ id: campaign.id });
		expect(policy.assertCanUpdate).toHaveBeenCalledWith(campaign, dto);
		expect(storagePolicy.assertExists).toHaveBeenCalledWith(dto.previewImage);
		expect(repository.update).toHaveBeenCalledWith(campaign.id, dto);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(CampaignUpdatedEvent));
	});
});
