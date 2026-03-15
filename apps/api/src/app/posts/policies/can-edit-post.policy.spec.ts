import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@pif/shared';
import { PostNotFoundException } from '../exceptions/post-not-found.exception';
import { PostsRepository } from '../repositories/posts.repository';
import { CanEditPostPolicy } from './can-edit-post.policy';

describe('CanEditPostPolicy', () => {
	let policy: CanEditPostPolicy;
	let repository: DeepMocked<PostsRepository>;

	const postId = faker.string.uuid();
	const userId = faker.string.uuid();
	const post = {
		id: postId,
		authorId: userId,
		animalId: faker.string.uuid(),
		media: []
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [CanEditPostPolicy, { provide: PostsRepository, useValue: createMock<PostsRepository>() }]
		}).compile();

		policy = module.get<CanEditPostPolicy>(CanEditPostPolicy);
		repository = module.get(PostsRepository);
	});

	it('throws PostNotFoundException when post not found', async () => {
		repository.findById.mockResolvedValue(undefined);

		await expect(policy.assertCanEdit(postId, userId, UserRole.VOLUNTEER)).rejects.toThrow(PostNotFoundException);
		expect(repository.findById).toHaveBeenCalledWith(postId);
	});

	it('returns post for ADMIN', async () => {
		repository.findById.mockResolvedValue(post as never);

		const result = await policy.assertCanEdit(postId, userId, UserRole.ADMIN);

		expect(result).toBe(post);
	});

	it('returns post for SENIOR_VOLUNTEER', async () => {
		repository.findById.mockResolvedValue(post as never);

		const result = await policy.assertCanEdit(postId, userId, UserRole.SENIOR_VOLUNTEER);

		expect(result).toBe(post);
	});

	it('returns post for VOLUNTEER when they are author', async () => {
		repository.findById.mockResolvedValue(post as never);

		const result = await policy.assertCanEdit(postId, userId, UserRole.VOLUNTEER);

		expect(result).toBe(post);
	});

	it('throws ForbiddenException when VOLUNTEER is not author', async () => {
		const otherPost = { id: post.id, authorId: faker.string.uuid(), animalId: post.animalId, media: [] as never[] };
		repository.findById.mockResolvedValue(otherPost as never);

		await expect(policy.assertCanEdit(postId, userId, UserRole.VOLUNTEER)).rejects.toThrow(ForbiddenException);
	});

	it('throws ForbiddenException for GUARDIAN role', async () => {
		repository.findById.mockResolvedValue(post as never);

		await expect(policy.assertCanEdit(postId, userId, UserRole.GUARDIAN)).rejects.toThrow(ForbiddenException);
	});
});
