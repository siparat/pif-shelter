import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostDeletedEvent } from '../../events/post-deleted/post-deleted.event';
import { CanEditPostPolicy } from '../../policies/can-edit-post.policy';
import { PostsRepository } from '../../repositories/posts.repository';
import { DeletePostCommand } from './delete-post.command';
import { DeletePostHandler } from './delete-post.handler';

describe('DeletePostHandler', () => {
	let handler: DeletePostHandler;
	let canEditPostPolicy: DeepMocked<CanEditPostPolicy>;
	let repository: DeepMocked<PostsRepository>;
	let eventBus: DeepMocked<EventBus>;

	const postId = faker.string.uuid();
	const userId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DeletePostHandler,
				{ provide: CanEditPostPolicy, useValue: createMock<CanEditPostPolicy>() },
				{ provide: PostsRepository, useValue: createMock<PostsRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<DeletePostHandler>(DeletePostHandler);
		canEditPostPolicy = module.get(CanEditPostPolicy);
		repository = module.get(PostsRepository);
		eventBus = module.get(EventBus);
	});

	it('deletes post and publishes PostDeletedEvent when post exists and user can edit', async () => {
		const post = { id: postId, authorId: userId } as never;

		repository.findById.mockResolvedValue(post);
		canEditPostPolicy.assertCanEdit.mockResolvedValue(post);
		repository.delete.mockResolvedValue(true);

		const command = new DeletePostCommand(postId, userId, UserRole.VOLUNTEER);
		await handler.execute(command);

		expect(repository.findById).toHaveBeenCalledWith(postId);
		expect(canEditPostPolicy.assertCanEdit).toHaveBeenCalledWith(postId, userId, UserRole.VOLUNTEER);
		expect(repository.delete).toHaveBeenCalledWith(postId);
		expect(eventBus.publish).toHaveBeenCalledWith(expect.any(PostDeletedEvent));
		expect((eventBus.publish as jest.Mock).mock.calls[0][0].postId).toBe(postId);
	});

	it('returns without publishing event when post not found (idempotent)', async () => {
		repository.findById.mockResolvedValue(undefined);

		await handler.execute(new DeletePostCommand(postId, userId, UserRole.ADMIN));

		expect(canEditPostPolicy.assertCanEdit).not.toHaveBeenCalled();
		expect(repository.delete).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('returns without publishing when delete returns false', async () => {
		const post = { id: postId } as never;
		repository.findById.mockResolvedValue(post);
		canEditPostPolicy.assertCanEdit.mockResolvedValue(post);
		repository.delete.mockResolvedValue(false);

		await handler.execute(new DeletePostCommand(postId, userId, UserRole.ADMIN));

		expect(repository.delete).toHaveBeenCalledWith(postId);
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws when policy throws', async () => {
		repository.findById.mockResolvedValue({ id: postId } as never);
		canEditPostPolicy.assertCanEdit.mockRejectedValue(new Error('Forbidden'));

		await expect(handler.execute(new DeletePostCommand(postId, userId, UserRole.GUARDIAN))).rejects.toThrow(
			'Forbidden'
		);
		expect(repository.delete).not.toHaveBeenCalled();
	});
});
