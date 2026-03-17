import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PostVisibilityEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostReactionSetEvent } from '../../events/post-reaction-set/post-reaction-set.event';
import { PostNotFoundException } from '../../exceptions/post-not-found.exception';
import { PostReactionNotPossibleException } from '../../exceptions/post-reaction-not-possible';
import { PostReactionsRepository } from '../../repositories/post-reactions.repository';
import { PostsRepository } from '../../repositories/posts.repository';
import { SetPostReactionCommand } from './set-post-reaction.command';

@CommandHandler(SetPostReactionCommand)
export class SetPostReactionHandler implements ICommandHandler<SetPostReactionCommand> {
	constructor(
		private readonly postsRepository: PostsRepository,
		private readonly postReactionsRepository: PostReactionsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ postId, emoji, visitorId }: SetPostReactionCommand): Promise<void> {
		const post = await this.postsRepository.findById(postId);
		if (!post) {
			throw new PostNotFoundException(postId);
		}

		if (post.visibility === PostVisibilityEnum.PRIVATE) {
			throw new PostReactionNotPossibleException();
		}

		await this.postReactionsRepository.upsertOrRemove(postId, visitorId, emoji);
		await this.eventBus.publish(new PostReactionSetEvent(postId));

		this.logger.log('Реакция на пост установлена', { postId, emoji, visitorId });
	}
}
