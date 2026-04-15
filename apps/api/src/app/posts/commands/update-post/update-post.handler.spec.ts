import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PostMediaTypeEnum, PostVisibilityEnum, UserRole } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { UpdatePostRequestDto } from '../../../core/dto';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { PostUpdatedEvent } from '../../events/post-updated/post-updated.event';
import { CanEditPostPolicy } from '../../policies/can-edit-post.policy';
import { PostsRepository } from '../../repositories/posts.repository';
import { UpdatePostCommand } from './update-post.command';
import { UpdatePostHandler } from './update-post.handler';

describe('UpdatePostHandler', () => {
	let handler: UpdatePostHandler;
	let canEditPostPolicy: DeepMocked<CanEditPostPolicy>;
	let fileStoragePolicy: DeepMocked<FileStoragePolicy>;
	let repository: DeepMocked<PostsRepository>;
	let eventBus: DeepMocked<EventBus>;

	const postId = faker.string.uuid();
	const userId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UpdatePostHandler,
				{ provide: CanEditPostPolicy, useValue: createMock<CanEditPostPolicy>() },
				{ provide: FileStoragePolicy, useValue: createMock<FileStoragePolicy>() },
				{ provide: PostsRepository, useValue: createMock<PostsRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<UpdatePostHandler>(UpdatePostHandler);
		canEditPostPolicy = module.get(CanEditPostPolicy);
		fileStoragePolicy = module.get(FileStoragePolicy);
		repository = module.get(PostsRepository);
		eventBus = module.get(EventBus);
	});

	it('updates post and publishes PostUpdatedEvent', async () => {
		const dto: UpdatePostRequestDto = { title: faker.lorem.sentence() };
		const updatedPost = { id: postId } as never;

		canEditPostPolicy.assertCanEdit.mockResolvedValue({ id: postId } as never);
		repository.update.mockResolvedValue(updatedPost);

		const command = new UpdatePostCommand(postId, dto, userId, UserRole.ADMIN);
		const result = await handler.execute(command);

		expect(canEditPostPolicy.assertCanEdit).toHaveBeenCalledWith(postId, userId, UserRole.ADMIN);
		expect(fileStoragePolicy.assertAllExist).not.toHaveBeenCalled();
		expect(repository.update).toHaveBeenCalledWith(postId, dto);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(PostUpdatedEvent));
		expect(result).toBe(postId);
	});

	it('calls assertAllExist when dto contains media', async () => {
		const dto: UpdatePostRequestDto = {
			media: [{ storageKey: 'posts/new.webp', type: PostMediaTypeEnum.IMAGE, order: 0 }]
		};
		const updatedPost = { id: postId } as never;

		canEditPostPolicy.assertCanEdit.mockResolvedValue({ id: postId } as never);
		fileStoragePolicy.assertAllExist.mockResolvedValue(undefined);
		repository.update.mockResolvedValue(updatedPost);

		await handler.execute(new UpdatePostCommand(postId, dto, userId, UserRole.VOLUNTEER));

		expect(fileStoragePolicy.assertAllExist).toHaveBeenCalledWith(['posts/new.webp']);
	});

	it('throws when policy throws', async () => {
		canEditPostPolicy.assertCanEdit.mockRejectedValue(new Error('Forbidden'));

		await expect(
			handler.execute(
				new UpdatePostCommand(postId, { visibility: PostVisibilityEnum.PRIVATE }, userId, UserRole.GUARDIAN)
			)
		).rejects.toThrow('Forbidden');
		expect(repository.update).not.toHaveBeenCalled();
	});
});
