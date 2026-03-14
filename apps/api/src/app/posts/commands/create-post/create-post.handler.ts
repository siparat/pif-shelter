import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { getAgeAtNow } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { PostCreatedEvent } from '../../events/post-created/post-created.event';
import { PostsRepository } from '../../repositories/posts.repository';
import { CanCreatePostPolicy } from './can-create-post.policy';
import { CreatePostCommand } from './create-post.command';

@CommandHandler(CreatePostCommand)
export class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
	constructor(
		private readonly canCreatePostPolicy: CanCreatePostPolicy,
		private readonly fileStoragePolicy: FileStoragePolicy,
		private readonly repository: PostsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto, authorId, authorRole }: CreatePostCommand): Promise<string> {
		const animal = await this.canCreatePostPolicy.assertCanCreatePost(dto.animalId, authorId, authorRole);

		const mediaKeys = dto.media.map((m) => m.storageKey);
		await this.fileStoragePolicy.assertAllExist(mediaKeys);

		const { years, months } = getAgeAtNow(animal.birthDate);
		const post = await this.repository.create(dto, authorId, years, months);

		await this.eventBus.publish(new PostCreatedEvent(post));

		this.logger.log('Пост создан', { postId: post.id, animalId: dto.animalId, authorId });

		return post.id || '';
	}
}
