import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAnimalRequestDto } from '@pif/contracts';
import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalCreatedEvent } from '../../events/animal-created.event';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { CreateAnimalCommand } from './create-animal.command';
import { CreateAnimalHandler } from './create-animal.handler';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';

describe('CreateAnimalHandler', () => {
	let handler: CreateAnimalHandler;
	let repository: DeepMocked<AnimalsRepository>;
	let eventBus: DeepMocked<EventBus>;
	let fileStoragePolicy: DeepMocked<FileStoragePolicy>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreateAnimalHandler,
				{
					provide: AnimalsRepository,
					useValue: createMock<AnimalsRepository>()
				},
				{
					provide: EventBus,
					useValue: createMock<EventBus>()
				},
				{
					provide: FileStoragePolicy,
					useValue: createMock<FileStoragePolicy>()
				},
				{
					provide: Logger,
					useValue: createMock<Logger>()
				}
			]
		}).compile();

		handler = module.get<CreateAnimalHandler>(CreateAnimalHandler);
		repository = module.get(AnimalsRepository);
		eventBus = module.get(EventBus);
		fileStoragePolicy = module.get(FileStoragePolicy);
	});

	it('should create an animal successfully', async () => {
		const dto: CreateAnimalRequestDto = {
			name: faker.person.firstName(),
			species: faker.helpers.enumValue(AnimalSpeciesEnum),
			gender: faker.helpers.enumValue(AnimalGenderEnum),
			birthDate: faker.date.birthdate({ min: 0, max: 5, mode: 'age' }).toISOString().split('T')[0],
			size: faker.helpers.enumValue(AnimalSizeEnum),
			coat: faker.helpers.enumValue(AnimalCoatEnum),
			color: faker.color.human(),
			description: faker.lorem.sentence(),
			avatarKey: 'animals/avatar.webp'
		};

		const command = new CreateAnimalCommand(dto);
		const expectedId = faker.string.uuid();

		repository.create.mockResolvedValue(expectedId);
		fileStoragePolicy.assertExists.mockResolvedValue(undefined);

		const result = await handler.execute(command);

		expect(fileStoragePolicy.assertExists).toHaveBeenCalledWith(dto.avatarKey);
		expect(repository.create).toHaveBeenCalledWith(dto);
		expect(eventBus.publish).toHaveBeenCalledWith(new AnimalCreatedEvent(expectedId, dto.species));
		expect(result).toBe(expectedId);
	});
});
