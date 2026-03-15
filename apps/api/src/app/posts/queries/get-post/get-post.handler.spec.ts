import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '@pif/cache';
import { PostMediaTypeEnum, PostVisibilityEnum, UserRole } from '@pif/shared';
import { PostNotFoundException } from '../../exceptions/post-not-found.exception';
import { PostMapper, PostResponseDto } from '../../mappers/post.mapper';
import { CanViewPostPolicy } from '../../policies/can-view-post.policy';
import { PostsRepository } from '../../repositories/posts.repository';
import { GetPostQueryHandler } from './get-post.handler';
import { GetPostQuery } from './get-post.query';

describe('GetPostQueryHandler', () => {
	let handler: GetPostQueryHandler;
	let repository: DeepMocked<PostsRepository>;
	let cache: DeepMocked<CacheService>;
	let canViewPostPolicy: DeepMocked<CanViewPostPolicy>;

	const postId = faker.string.uuid();
	const animalId = faker.string.uuid();
	const mockPost = {
		id: postId,
		animalId,
		authorId: faker.string.uuid(),
		title: faker.lorem.sentence(),
		body: faker.lorem.paragraph(),
		visibility: PostVisibilityEnum.PUBLIC,
		media: [] as { id: string; storageKey: string; type: PostMediaTypeEnum; order: number }[],
		campaignId: null,
		animalAgeYears: 1,
		animalAgeMonths: 6,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};

	const mockResponse: PostResponseDto = {
		id: mockPost.id,
		animalId: mockPost.animalId,
		authorId: mockPost.authorId,
		title: mockPost.title,
		body: mockPost.body,
		visibility: mockPost.visibility,
		media: [],
		campaignId: mockPost.campaignId,
		animalAgeYears: mockPost.animalAgeYears,
		animalAgeMonths: mockPost.animalAgeMonths,
		createdAt: mockPost.createdAt,
		updatedAt: mockPost.updatedAt
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GetPostQueryHandler,
				{ provide: PostsRepository, useValue: createMock<PostsRepository>() },
				{ provide: CacheService, useValue: createMock<CacheService>() },
				{ provide: CanViewPostPolicy, useValue: createMock<CanViewPostPolicy>() }
			]
		}).compile();

		handler = module.get<GetPostQueryHandler>(GetPostQueryHandler);
		repository = module.get(PostsRepository);
		cache = module.get(CacheService);
		canViewPostPolicy = module.get(CanViewPostPolicy);
	});

	it('returns cached result when present and view allowed', async () => {
		cache.get.mockResolvedValue(mockResponse);
		canViewPostPolicy.assertCanView.mockResolvedValue(undefined);

		const query = new GetPostQuery(postId, 'user-1', UserRole.VOLUNTEER);
		const result = await handler.execute(query);

		expect(result).toEqual(mockResponse);
		expect(canViewPostPolicy.assertCanView).toHaveBeenCalledWith(mockResponse, 'user-1', UserRole.VOLUNTEER);
		expect(repository.findById).not.toHaveBeenCalled();
		expect(cache.set).not.toHaveBeenCalled();
	});

	it('throws PostNotFoundException when post not found', async () => {
		cache.get.mockResolvedValue(null);
		repository.findById.mockResolvedValue(undefined);

		const query = new GetPostQuery(postId, null, null);

		await expect(handler.execute(query)).rejects.toThrow(PostNotFoundException);
		expect(canViewPostPolicy.assertCanView).not.toHaveBeenCalled();
	});

	it('loads from DB, asserts view, sets cache and returns when cache miss', async () => {
		jest.spyOn(PostMapper, 'toResponse').mockReturnValue(mockResponse);
		cache.get.mockResolvedValue(null);
		repository.findById.mockResolvedValue(mockPost as never);
		canViewPostPolicy.assertCanView.mockResolvedValue(undefined);
		cache.set.mockResolvedValue(undefined);

		const query = new GetPostQuery(postId, 'user-1', UserRole.ADMIN);
		const result = await handler.execute(query);

		expect(repository.findById).toHaveBeenCalledWith(postId);
		expect(canViewPostPolicy.assertCanView).toHaveBeenCalledWith(mockPost as never, 'user-1', UserRole.ADMIN);
		expect(PostMapper.toResponse).toHaveBeenCalledWith(mockPost as never);
		expect(cache.set).toHaveBeenCalled();
		expect(result).toEqual(mockResponse);
	});

	it('throws when canViewPostPolicy throws on cached result', async () => {
		cache.get.mockResolvedValue(mockResponse);
		canViewPostPolicy.assertCanView.mockRejectedValue(new Error('Forbidden'));

		await expect(handler.execute(new GetPostQuery(postId, 'user-1', UserRole.GUARDIAN))).rejects.toThrow(
			'Forbidden'
		);
	});
});
