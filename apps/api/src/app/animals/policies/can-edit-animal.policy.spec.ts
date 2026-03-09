import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@pif/shared';
import { AnimalNotFoundException } from '../exceptions/animal-not-found.exception';
import { AnimalNotEditableByUserException } from '../exceptions/animal-not-editable-by-user.exception';
import { AnimalsRepository } from '../repositories/animals.repository';
import { CanEditAnimalPolicy } from './can-edit-animal.policy';

describe('CanEditAnimalPolicy', () => {
	let policy: CanEditAnimalPolicy;
	let repository: DeepMocked<AnimalsRepository>;

	const animalId = faker.string.uuid();
	const userId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CanEditAnimalPolicy, { provide: AnimalsRepository, useValue: createMock<AnimalsRepository>() }]
		}).compile();

		policy = module.get<CanEditAnimalPolicy>(CanEditAnimalPolicy);
		repository = module.get(AnimalsRepository);
	});

	it('throws AnimalNotFoundException when animal not found', async () => {
		repository.findById.mockResolvedValue(undefined);

		await expect(policy.assertCanEdit(animalId, userId, UserRole.VOLUNTEER)).rejects.toThrow(
			AnimalNotFoundException
		);
	});

	it('allows ADMIN and returns animal', async () => {
		const animal = { id: animalId, curatorId: null } as never;
		repository.findById.mockResolvedValue(animal);

		const result = await policy.assertCanEdit(animalId, userId, UserRole.ADMIN);

		expect(result).toBe(animal);
		expect(repository.findById).toHaveBeenCalledWith(animalId);
	});

	it('allows SENIOR_VOLUNTEER and returns animal', async () => {
		const animal = { id: animalId, curatorId: faker.string.uuid() } as never;
		repository.findById.mockResolvedValue(animal);

		const result = await policy.assertCanEdit(animalId, userId, UserRole.SENIOR_VOLUNTEER);

		expect(result).toBe(animal);
	});

	it('allows VOLUNTEER when they are the curator', async () => {
		const animal = { id: animalId, curatorId: userId } as never;
		repository.findById.mockResolvedValue(animal);

		const result = await policy.assertCanEdit(animalId, userId, UserRole.VOLUNTEER);

		expect(result).toBe(animal);
	});

	it('throws AnimalNotEditableByUserException when VOLUNTEER is not the curator', async () => {
		const animal = { id: animalId, curatorId: faker.string.uuid() } as never;
		repository.findById.mockResolvedValue(animal);

		await expect(policy.assertCanEdit(animalId, userId, UserRole.VOLUNTEER)).rejects.toThrow(
			AnimalNotEditableByUserException
		);
	});

	it('throws AnimalNotEditableByUserException when VOLUNTEER and animal has no curator', async () => {
		const animal = { id: animalId, curatorId: null } as never;
		repository.findById.mockResolvedValue(animal);

		await expect(policy.assertCanEdit(animalId, userId, UserRole.VOLUNTEER)).rejects.toThrow(
			AnimalNotEditableByUserException
		);
	});

	it('throws AnimalNotEditableByUserException for GUARDIAN role', async () => {
		const animal = { id: animalId, curatorId: userId } as never;
		repository.findById.mockResolvedValue(animal);

		await expect(policy.assertCanEdit(animalId, userId, UserRole.GUARDIAN)).rejects.toThrow(
			AnimalNotEditableByUserException
		);
	});
});
