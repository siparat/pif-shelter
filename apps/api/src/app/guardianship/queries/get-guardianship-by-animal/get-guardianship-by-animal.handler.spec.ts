import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@pif/cache';
import { DatabaseService } from '@pif/database';
import { GuardianshipStatusEnum } from '@pif/shared';
import { GuardianshipNotFoundException } from '../../exceptions/guardianship-not-found.exception';
import { GetGuardianshipByAnimalHandler } from './get-guardianship-by-animal.handler';
import { GetGuardianshipByAnimalQuery } from './get-guardianship-by-animal.query';

describe('GetGuardianshipByAnimalHandler', () => {
	let handler: GetGuardianshipByAnimalHandler;
	let db: DeepMocked<DatabaseService>;
	let cache: DeepMocked<CacheService>;

	const animalId = '11111111-1111-1111-1111-111111111111';
	const mockRow = {
		id: '22222222-2222-2222-2222-222222222222',
		animalId,
		guardianUserId: 'user-1',
		monthlyAmount: 1000,
		status: GuardianshipStatusEnum.ACTIVE,
		subscriptionId: 'sub-1',
		startedAt: new Date(),
		cancelledAt: null,
		animal: {
			id: animalId,
			name: 'Cat',
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null
		},
		guardian: {
			id: 'user-1',
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: null
		}
	};

	beforeEach(async () => {
		const mockFindFirst = jest.fn();
		db = createMock<DatabaseService>({
			client: {
				query: {
					guardianships: {
						findFirst: mockFindFirst
					}
				}
			}
		}) as DeepMocked<DatabaseService>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetGuardianshipByAnimalHandler,
				{ provide: DatabaseService, useValue: db },
				{ provide: CacheService, useValue: createMock<CacheService>() }
			]
		}).compile();

		handler = module.get<GetGuardianshipByAnimalHandler>(GetGuardianshipByAnimalHandler);
		cache = module.get(CacheService);
	});

	it('throws GuardianshipNotFoundException when no guardianship', async () => {
		(db.client.query.guardianships.findFirst as jest.Mock).mockResolvedValue(null);
		cache.get.mockResolvedValue(null);

		await expect(handler.execute(new GetGuardianshipByAnimalQuery(animalId))).rejects.toThrow(
			GuardianshipNotFoundException
		);
	});

	it('returns cached result when present', async () => {
		cache.get.mockResolvedValue(mockRow);

		const result = await handler.execute(new GetGuardianshipByAnimalQuery(animalId));

		expect(result).toEqual(mockRow);
		expect(db.client.query.guardianships.findFirst).not.toHaveBeenCalled();
	});

	it('returns result and sets cache when guardianship exists with relations', async () => {
		cache.get.mockResolvedValue(null);
		(db.client.query.guardianships.findFirst as jest.Mock).mockResolvedValue(mockRow);

		const result = await handler.execute(new GetGuardianshipByAnimalQuery(animalId));

		expect(result).toEqual(mockRow);
		expect(cache.set).toHaveBeenCalledWith(`guardianship:by-animal:${animalId}`, mockRow);
	});
});
