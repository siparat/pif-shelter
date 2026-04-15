import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PostMediaTypeEnum, PostVisibilityEnum, UserRole } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { CreatePostRequestDto } from '../../../core/dto';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { PostCreatedEvent } from '../../events/post-created/post-created.event';
import { PostsRepository } from '../../repositories/posts.repository';
import { CanCreatePostPolicy } from './can-create-post.policy';
import { CreatePostCommand } from './create-post.command';
import { CreatePostHandler } from './create-post.handler';

describe('CreatePostHandler', () => {
	let handler: CreatePostHandler;
	let canCreatePostPolicy: DeepMocked<CanCreatePostPolicy>;
	let fileStoragePolicy: DeepMocked<FileStoragePolicy>;
	let repository: DeepMocked<PostsRepository>;
	let eventBus: DeepMocked<EventBus>;

	const animalId = faker.string.uuid();
	const authorId = faker.string.uuid();
	const birthDate = faker.date.past({ years: 2 }).toISOString().split('T')[0];

	const dto: CreatePostRequestDto = {
		animalId,
		title: faker.lorem.sentence(),
		body: faker.lorem.paragraphs(2),
		visibility: PostVisibilityEnum.PUBLIC,
		media: [
			{ storageKey: 'posts/img1.webp', type: PostMediaTypeEnum.IMAGE, order: 0 },
			{ storageKey: 'posts/img2.webp', type: PostMediaTypeEnum.IMAGE, order: 1 }
		]
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CreatePostHandler,
				{ provide: CanCreatePostPolicy, useValue: createMock<CanCreatePostPolicy>() },
				{ provide: FileStoragePolicy, useValue: createMock<FileStoragePolicy>() },
				{ provide: PostsRepository, useValue: createMock<PostsRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<CreatePostHandler>(CreatePostHandler);
		canCreatePostPolicy = module.get(CanCreatePostPolicy);
		fileStoragePolicy = module.get(FileStoragePolicy);
		repository = module.get(PostsRepository);
		eventBus = module.get(EventBus);
	});

	it('creates post and publishes PostCreatedEvent', async () => {
		const animal = { id: animalId, birthDate, curatorId: authorId } as never;
		const postId = faker.string.uuid();
		const createdPost = { id: postId, animalId, authorId } as never;

		canCreatePostPolicy.assertCanCreatePost.mockResolvedValue(animal);
		fileStoragePolicy.assertAllExist.mockResolvedValue(undefined);
		repository.create.mockResolvedValue(createdPost);

		const command = new CreatePostCommand(dto, authorId, UserRole.VOLUNTEER);
		const result = await handler.execute(command);

		expect(canCreatePostPolicy.assertCanCreatePost).toHaveBeenCalledWith(animalId, authorId, UserRole.VOLUNTEER);
		expect(fileStoragePolicy.assertAllExist).toHaveBeenCalledWith(['posts/img1.webp', 'posts/img2.webp']);
		expect(repository.create).toHaveBeenCalledWith(dto, authorId, expect.any(Number), expect.any(Number));
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(PostCreatedEvent));
		expect((eventBus.publish as jest.Mock).mock.calls[0][0]).toBeInstanceOf(PostCreatedEvent);
		expect((eventBus.publish as jest.Mock).mock.calls[0][0].post).toEqual(createdPost);
		expect(result).toBe(postId);
	});

	it('throws when policy throws', async () => {
		canCreatePostPolicy.assertCanCreatePost.mockRejectedValue(new Error('Animal not found'));

		const command = new CreatePostCommand(dto, authorId, UserRole.VOLUNTEER);

		await expect(handler.execute(command)).rejects.toThrow('Animal not found');
		expect(repository.create).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});
});
