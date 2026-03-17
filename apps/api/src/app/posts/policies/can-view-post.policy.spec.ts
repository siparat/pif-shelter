import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@pif/database';
import { GuardianshipStatusEnum, PostVisibilityEnum, UserRole } from '@pif/shared';
import { NotGuardianException } from '../exceptions/not-guardian.exception';
import { CanViewPostPolicy, PostViewContext } from './can-view-post.policy';

describe('CanViewPostPolicy', () => {
	let policy: CanViewPostPolicy;
	let db: DeepMocked<DatabaseService>;

	const animalId = faker.string.uuid();
	const userId = faker.string.uuid();

	beforeEach(async () => {
		const mockFindFirst = jest.fn();
		db = createMock<DatabaseService>({
			client: {
				query: {
					guardianships: { findFirst: mockFindFirst }
				}
			}
		}) as DeepMocked<DatabaseService>;

		const module: TestingModule = await Test.createTestingModule({
			providers: [CanViewPostPolicy, { provide: DatabaseService, useValue: db }]
		}).compile();

		policy = module.get<CanViewPostPolicy>(CanViewPostPolicy);
	});

	it('allows PUBLIC post without user', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PUBLIC, animalId };

		await expect(policy.assertCanView(post, null, null)).resolves.toBeUndefined();
		expect(db.client.query.guardianships.findFirst).not.toHaveBeenCalled();
	});

	it('allows PUBLIC post with user', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PUBLIC, animalId };

		await expect(policy.assertCanView(post, userId, UserRole.GUARDIAN)).resolves.toBeUndefined();
	});

	it('throws NotGuardianException for PRIVATE post when no user', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PRIVATE, animalId };

		await expect(policy.assertCanView(post, null, null)).rejects.toThrow(NotGuardianException);
	});

	it('allows PRIVATE post for VOLUNTEER', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PRIVATE, animalId };

		await expect(policy.assertCanView(post, userId, UserRole.VOLUNTEER)).resolves.toBeUndefined();
		expect(db.client.query.guardianships.findFirst).not.toHaveBeenCalled();
	});

	it('allows PRIVATE post for SENIOR_VOLUNTEER', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PRIVATE, animalId };

		await expect(policy.assertCanView(post, userId, UserRole.SENIOR_VOLUNTEER)).resolves.toBeUndefined();
	});

	it('allows PRIVATE post for ADMIN', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PRIVATE, animalId };

		await expect(policy.assertCanView(post, userId, UserRole.ADMIN)).resolves.toBeUndefined();
	});

	it('allows PRIVATE post for GUARDIAN when active guardianship exists', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PRIVATE, animalId };
		(db.client.query.guardianships.findFirst as jest.Mock).mockResolvedValue({
			id: faker.string.uuid(),
			animalId,
			guardianUserId: userId,
			status: GuardianshipStatusEnum.ACTIVE
		});

		await expect(policy.assertCanView(post, userId, UserRole.GUARDIAN)).resolves.toBeUndefined();
		expect(db.client.query.guardianships.findFirst).toHaveBeenCalledWith({
			where: {
				animalId,
				guardianUserId: userId,
				status: GuardianshipStatusEnum.ACTIVE
			}
		});
	});

	it('throws NotGuardianException for PRIVATE post when GUARDIAN has no active guardianship', async () => {
		const post: PostViewContext = { visibility: PostVisibilityEnum.PRIVATE, animalId };
		(db.client.query.guardianships.findFirst as jest.Mock).mockResolvedValue(null);

		await expect(policy.assertCanView(post, userId, UserRole.GUARDIAN)).rejects.toThrow(NotGuardianException);
	});
});
