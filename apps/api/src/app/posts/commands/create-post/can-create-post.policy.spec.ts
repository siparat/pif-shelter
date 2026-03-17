import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@pif/shared';
import { AnimalsService } from '../../../animals/animals.service';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { InsufficientRoleException } from '../../exceptions/insufficient-role.exception';
import { NotCuratorException } from '../../exceptions/not-curator.exception';
import { CanCreatePostPolicy } from './can-create-post.policy';

describe('CanCreatePostPolicy', () => {
	let policy: CanCreatePostPolicy;
	let animalsService: DeepMocked<AnimalsService>;

	const animalId = faker.string.uuid();
	const userId = faker.string.uuid();
	const animal: { id: string; birthDate: string; curatorId: string | null } = {
		id: animalId,
		birthDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
		curatorId: userId
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CanCreatePostPolicy, { provide: AnimalsService, useValue: createMock<AnimalsService>() }]
		}).compile();

		policy = module.get<CanCreatePostPolicy>(CanCreatePostPolicy);
		animalsService = module.get(AnimalsService);
	});

	it('throws AnimalNotFoundException when animal not found', async () => {
		animalsService.findById.mockResolvedValue(undefined);

		await expect(policy.assertCanCreatePost(animalId, userId, UserRole.VOLUNTEER)).rejects.toThrow(
			AnimalNotFoundException
		);
		await expect(policy.assertCanCreatePost(animalId, userId, UserRole.VOLUNTEER)).rejects.toThrow(
			`Животное с ID ${animalId} не найдено`
		);
	});

	it('returns animal for ADMIN', async () => {
		animalsService.findById.mockResolvedValue(animal as never);

		const result = await policy.assertCanCreatePost(animalId, userId, UserRole.ADMIN);

		expect(result).toBe(animal);
		expect(animalsService.findById).toHaveBeenCalledWith(animalId);
	});

	it('returns animal for SENIOR_VOLUNTEER', async () => {
		animalsService.findById.mockResolvedValue(animal as never);

		const result = await policy.assertCanCreatePost(animalId, userId, UserRole.SENIOR_VOLUNTEER);

		expect(result).toBe(animal);
	});

	it('returns animal for VOLUNTEER when they are curator', async () => {
		animalsService.findById.mockResolvedValue(animal as never);

		const result = await policy.assertCanCreatePost(animalId, userId, UserRole.VOLUNTEER);

		expect(result).toBe(animal);
	});

	it('throws NotCuratorException when VOLUNTEER is not curator', async () => {
		const otherCurator = { ...animal, curatorId: faker.string.uuid() };
		animalsService.findById.mockResolvedValue(otherCurator as never);

		await expect(policy.assertCanCreatePost(animalId, userId, UserRole.VOLUNTEER)).rejects.toThrow(
			NotCuratorException
		);
	});

	it('throws InsufficientRoleException for GUARDIAN role', async () => {
		animalsService.findById.mockResolvedValue(animal as never);

		await expect(policy.assertCanCreatePost(animalId, userId, UserRole.GUARDIAN)).rejects.toThrow(
			InsufficientRoleException
		);
	});
});
