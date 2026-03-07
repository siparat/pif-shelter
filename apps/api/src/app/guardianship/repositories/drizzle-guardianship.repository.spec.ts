import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService, guardianships } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { AnimalAlreadyHasGuardianException } from '../exceptions/animal-already-has-guardian.exception';
import { DrizzleGuardianshipRepository } from './drizzle-guardianship.repository';

describe('DrizzleGuardianshipRepository', () => {
	let repository: DrizzleGuardianshipRepository;
	let db: DeepMocked<DatabaseService>;

	const userId = faker.string.uuid();
	const animalId = faker.string.uuid();
	const subscriptionId = faker.string.uuid();

	beforeEach(async () => {
		db = createMock<DatabaseService>({
			client: {
				query: { guardianships: { findFirst: jest.fn() } },
				update: jest.fn().mockReturnValue({
					set: jest.fn().mockReturnValue({
						where: jest.fn().mockResolvedValue(undefined)
					})
				})
			}
		}) as DeepMocked<DatabaseService>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [DrizzleGuardianshipRepository, { provide: DatabaseService, useValue: db }]
		}).compile();

		repository = module.get<DrizzleGuardianshipRepository>(DrizzleGuardianshipRepository);
	});

	describe('createPending', () => {
		it('returns guardianship when insert succeeds', async () => {
			const created = {
				id: faker.string.uuid(),
				animalId,
				guardianUserId: userId,
				subscriptionId,
				status: GuardianshipStatusEnum.PENDING_PAYMENT,
				startedAt: new Date(),
				cancelledAt: null,
				cancellationToken: faker.string.uuid()
			};
			const insertChain = {
				values: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([created]) })
			};
			(db.client as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue(insertChain);

			const result = await repository.createPending(userId, animalId, subscriptionId);

			expect(result).toEqual(created);
		});

		it('throws AnimalAlreadyHasGuardianException when insert fails with PG unique_violation (23505)', async () => {
			const err = Object.assign(new Error('duplicate key'), { code: '23505' });
			const insertChain = {
				values: jest.fn().mockReturnValue({ returning: jest.fn().mockRejectedValue(err) })
			};
			(db.client as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue(insertChain);

			await expect(repository.createPending(userId, animalId, subscriptionId)).rejects.toThrow(
				AnimalAlreadyHasGuardianException
			);
		});

		it('rethrows when insert fails with other error', async () => {
			const err = new Error('connection lost');
			const insertChain = {
				values: jest.fn().mockReturnValue({ returning: jest.fn().mockRejectedValue(err) })
			};
			(db.client as unknown as { insert: jest.Mock }).insert = jest.fn().mockReturnValue(insertChain);

			await expect(repository.createPending(userId, animalId, subscriptionId)).rejects.toThrow('connection lost');
		});
	});
});
