import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { PostUpdatedEvent } from '../../events/post-updated/post-updated.event';
import { CanEditPostPolicy } from '../../policies/can-edit-post.policy';
import { PostsRepository } from '../../repositories/posts.repository';
import { UpdatePostCommand } from './update-post.command';

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
	constructor(
		private readonly canEditPostPolicy: CanEditPostPolicy,
		private readonly fileStoragePolicy: FileStoragePolicy,
		private readonly repository: PostsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ postId, dto, userId, userRole }: UpdatePostCommand): Promise<string> {
		await this.canEditPostPolicy.assertCanEdit(postId, userId, userRole);

		if (dto.media && dto.media.length > 0) {
			const mediaKeys = dto.media.map((m) => m.storageKey);
			await this.fileStoragePolicy.assertAllExist(mediaKeys);
		}

		const post = await this.repository.update(postId, dto);

		await this.eventBus.publish(new PostUpdatedEvent(post));

		this.logger.log('Пост обновлён', { postId, userId, userRole });

		return postId;
	}
}
