import { faker } from '@faker-js/faker/locale/ru';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { BadRequestException } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { campaigns } from '@pif/database';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { CreateCampaignRequestDto } from '../../../core/dto';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { CampaignCreatedEvent } from '../../events/campaign-created/campaign-created.event';
import { InvalidTimeIntervalException } from '../../exceptions/invalid-time-interval.exception';
import { CanCreateCampaignPolicy } from '../../policies/can-create-campaign.policy';
import { CampaignsRepository } from '../../repositories/campaigns.repository';
import { CreateCampaignCommand } from './create-campaign.command';
import { CreateCampaignHandler } from './create-campaign.handler';

describe('CreateCampaignHandler', () => {
	let handler: CreateCampaignHandler;
	let repository: DeepMocked<CampaignsRepository>;
	let policy: DeepMocked<CanCreateCampaignPolicy>;
	let storagePolicy: DeepMocked<FileStoragePolicy>;
	let eventBus: DeepMocked<EventBus>;

	const dto: CreateCampaignRequestDto = {
		title: faker.word.words(6),
		description: faker.word.words(100),
		goal: faker.number.int({ min: 10000, max: 10000000 }),
		endsAt: faker.date.future().toISOString(),
		previewImage: `campaigns/${randomUUID()}.png`
	};

	const campaign = {
		id: randomUUID(),
		animalId: dto.animalId,
		title: dto.title
	} as typeof campaigns.$inferSelect;

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			providers: [
				CreateCampaignHandler,
				{ provide: CampaignsRepository, useValue: createMock<CampaignsRepository>() },
				{ provide: CanCreateCampaignPolicy, useValue: createMock<CanCreateCampaignPolicy>() },
				{ provide: FileStoragePolicy, useValue: createMock<FileStoragePolicy>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get(CreateCampaignHandler);
		repository = module.get(CampaignsRepository);
		policy = module.get(CanCreateCampaignPolicy);
		storagePolicy = module.get(FileStoragePolicy);
		eventBus = module.get(EventBus);
	});

	it('throws when policy throws', async () => {
		policy.assertCanCreate.mockRejectedValue(new InvalidTimeIntervalException());

		const command = new CreateCampaignCommand(dto, randomUUID());

		await expect(handler.execute(command)).rejects.toThrow(InvalidTimeIntervalException);
		expect(policy.assertCanCreate).toHaveBeenCalledWith(dto);
		expect(storagePolicy.assertExists).not.toHaveBeenCalled();
		expect(repository.create).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when storage policy throws', async () => {
		storagePolicy.assertExists.mockRejectedValue(new BadRequestException('Изображение не найдено'));

		const command = new CreateCampaignCommand(dto, randomUUID());

		await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
		expect(policy.assertCanCreate).toHaveBeenCalledWith(dto);
		expect(storagePolicy.assertExists).toHaveBeenCalledWith(dto.previewImage);
		expect(repository.create).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('creates campaign and publishes CampaignCreatedEvent', async () => {
		policy.assertCanCreate.mockResolvedValue(undefined);
		storagePolicy.assertExists.mockResolvedValue(undefined);
		repository.create.mockResolvedValue(campaign);

		const command = new CreateCampaignCommand(dto, randomUUID());
		const result = await handler.execute(command);

		expect(result).toStrictEqual({ id: campaign.id });
		expect(policy.assertCanCreate).toHaveBeenCalledWith(dto);
		expect(storagePolicy.assertExists).toHaveBeenCalledWith(dto.previewImage);
		expect(repository.create).toHaveBeenCalledWith(dto);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(CampaignCreatedEvent));
	});

	it('creates campaign and publishes CampaignCreatedEvent without preview image', async () => {
		const dtoWithoutImage = { ...dto, previewImage: undefined };

		policy.assertCanCreate.mockResolvedValue(undefined);
		repository.create.mockResolvedValue(campaign);

		const command = new CreateCampaignCommand(dtoWithoutImage, randomUUID());
		const result = await handler.execute(command);

		expect(result).toStrictEqual({ id: campaign.id });
		expect(policy.assertCanCreate).toHaveBeenCalledWith(dtoWithoutImage);
		expect(storagePolicy.assertExists).not.toHaveBeenCalled();
		expect(repository.create).toHaveBeenCalledWith(dtoWithoutImage);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(CampaignCreatedEvent));
	});
});
