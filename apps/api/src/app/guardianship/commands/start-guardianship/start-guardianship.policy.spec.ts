import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { GuardianshipStatusEnum } from '@pif/shared';
import { AnimalNotFoundException } from '../../../animals/exceptions/animal-not-found.exception';
import { AnimalsService } from '../../../animals/animals.service';
import { AnimalAlreadyHasGuardianException } from '../../exceptions/animal-already-has-guardian.exception';
import { AnimalCostOfGuardianshipNotSetException } from '../../exceptions/animal-cost-of-guardianship-not-set.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { StartGuardianshipPolicy } from './start-guardianship.policy';

describe('StartGuardianshipPolicy', () => {
	let policy: StartGuardianshipPolicy;
	let animalsService: DeepMocked<AnimalsService>;
	let repository: DeepMocked<GuardianshipRepository>;

	const animalId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StartGuardianshipPolicy,
				{ provide: AnimalsService, useValue: createMock<AnimalsService>() },
				{ provide: GuardianshipRepository, useValue: createMock<GuardianshipRepository>() }
			]
		}).compile();

		policy = module.get<StartGuardianshipPolicy>(StartGuardianshipPolicy);
		animalsService = module.get(AnimalsService);
		repository = module.get(GuardianshipRepository);
	});

	it('throws AnimalNotFoundException when animal not found', async () => {
		animalsService.findById.mockResolvedValue(undefined);

		await expect(policy.assertCanStart(animalId)).rejects.toThrow(AnimalNotFoundException);
		expect(repository.findActiveOrPendingByAnimalId).not.toHaveBeenCalled();
	});

	it('throws AnimalCostOfGuardianshipNotSetException when costOfGuardianship is null', async () => {
		animalsService.findById.mockResolvedValue({
			id: animalId,
			costOfGuardianship: null
		} as never);
		repository.findActiveOrPendingByAnimalId.mockResolvedValue(undefined);

		await expect(policy.assertCanStart(animalId)).rejects.toThrow(AnimalCostOfGuardianshipNotSetException);
	});

	it('throws AnimalCostOfGuardianshipNotSetException when costOfGuardianship is zero', async () => {
		animalsService.findById.mockResolvedValue({
			id: animalId,
			costOfGuardianship: 0
		} as never);
		repository.findActiveOrPendingByAnimalId.mockResolvedValue(undefined);

		await expect(policy.assertCanStart(animalId)).rejects.toThrow(AnimalCostOfGuardianshipNotSetException);
	});

	it('throws AnimalAlreadyHasGuardianException when animal has active or pending guardianship', async () => {
		animalsService.findById.mockResolvedValue({
			id: animalId,
			costOfGuardianship: 1000
		} as never);
		repository.findActiveOrPendingByAnimalId.mockResolvedValue({
			id: faker.string.uuid(),
			animalId,
			status: GuardianshipStatusEnum.PENDING_PAYMENT
		} as never);

		await expect(policy.assertCanStart(animalId)).rejects.toThrow(AnimalAlreadyHasGuardianException);
	});

	it('returns animal when no active or pending guardianship and cost is set', async () => {
		const animal = { id: animalId, costOfGuardianship: 3200 } as never;
		animalsService.findById.mockResolvedValue(animal);
		repository.findActiveOrPendingByAnimalId.mockResolvedValue(undefined);

		const result = await policy.assertCanStart(animalId);

		expect(result).toBe(animal);
		expect(repository.findActiveOrPendingByAnimalId).toHaveBeenCalledWith(animalId);
	});
});
