import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { PostDeletedEvent } from '../../events/post-deleted/post-deleted.event';
import { CanEditPostPolicy } from '../../policies/can-edit-post.policy';
import { PostsRepository } from '../../repositories/posts.repository';
import { DeletePostCommand } from './delete-post.command';

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
	constructor(
		private readonly canEditPostPolicy: CanEditPostPolicy,
		private readonly repository: PostsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute(command: DeletePostCommand): Promise<void> {
		const { postId, userId, userRole } = command;

		const post = await this.repository.findById(postId);
		if (!post) {
			return;
		}

		await this.canEditPostPolicy.assertCanEdit(postId, userId, userRole);

		const isDeleted = await this.repository.delete(postId);
		if (!isDeleted) {
			return;
		}

		await this.eventBus.publish(new PostDeletedEvent(postId));

		this.logger.log('Пост удалён', { postId, userId });
	}
}
