import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'nestjs-pino';
import { UsersService } from '../../../users/users.service';
import { AnimalCuratorSetEvent } from '../../events/animal-curator-set/animal-curator-set.event';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { CuratorNotFoundException } from '../../exceptions/curator-nof-found.exception';
import { AnimalsRepository } from '../../repositories/animals.repository';
import { SetAnimalCuratorCommand } from './set-animal-curator.command';
import { SetAnimalCuratorHandler } from './set-animal-curator.handler';

describe('SetAnimalCuratorHandler', () => {
	let handler: SetAnimalCuratorHandler;
	let repository: DeepMocked<AnimalsRepository>;
	let usersService: DeepMocked<UsersService>;
	let eventBus: DeepMocked<EventBus>;

	const animalId = faker.string.uuid();
	const curatorId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SetAnimalCuratorHandler,
				{ provide: AnimalsRepository, useValue: createMock<AnimalsRepository>() },
				{ provide: UsersService, useValue: createMock<UsersService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<SetAnimalCuratorHandler>(SetAnimalCuratorHandler);
		repository = module.get(AnimalsRepository);
		usersService = module.get(UsersService);
		eventBus = module.get(EventBus);
	});

	it('throws AnimalNotFoundException when animal not found', async () => {
		repository.findById.mockResolvedValue(undefined);

		await expect(handler.execute(new SetAnimalCuratorCommand(animalId, curatorId))).rejects.toThrow(
			AnimalNotFoundException
		);

		expect(repository.setCurator).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws CuratorNotFoundException when curator not found', async () => {
		repository.findById.mockResolvedValue({ id: animalId, curatorId: null } as never);
		usersService.findById.mockResolvedValue(undefined);

		await expect(handler.execute(new SetAnimalCuratorCommand(animalId, curatorId))).rejects.toThrow(
			CuratorNotFoundException
		);

		expect(usersService.findById).toHaveBeenCalledWith(curatorId);
		expect(repository.setCurator).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('sets curator and publishes AnimalCuratorSetEvent', async () => {
		repository.findById.mockResolvedValue({ id: animalId, curatorId: null } as never);
		usersService.findById.mockResolvedValue({ id: curatorId } as never);
		repository.setCurator.mockResolvedValue(undefined);

		const result = await handler.execute(new SetAnimalCuratorCommand(animalId, curatorId));

		expect(repository.findById).toHaveBeenCalledWith(animalId);
		expect(usersService.findById).toHaveBeenCalledWith(curatorId);
		expect(repository.setCurator).toHaveBeenCalledWith(animalId, curatorId);
		expect(eventBus.publish).toHaveBeenCalledWith(new AnimalCuratorSetEvent(animalId));
		expect(result).toEqual({ animalId, curatorId });
	});

	it('unsets curator when curatorId is null and publishes event', async () => {
		const previousCuratorId = faker.string.uuid();
		repository.findById.mockResolvedValue({ id: animalId, curatorId: previousCuratorId } as never);
		repository.setCurator.mockResolvedValue(undefined);

		const result = await handler.execute(new SetAnimalCuratorCommand(animalId, null));

		expect(usersService.findById).not.toHaveBeenCalled();
		expect(repository.setCurator).toHaveBeenCalledWith(animalId, null);
		expect(eventBus.publish).toHaveBeenCalledWith(new AnimalCuratorSetEvent(animalId));
		expect(result).toEqual({ animalId, curatorId: null });
	});
});
