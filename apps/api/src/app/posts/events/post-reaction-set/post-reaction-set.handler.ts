import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { PostCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostReactionSetEvent } from './post-reaction-set.event';

@EventsHandler(PostReactionSetEvent)
export class PostReactionSetHandler implements IEventHandler<PostReactionSetEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ postId }: PostReactionSetEvent): Promise<void> {
		this.logger.log('Сброс кэша после изменения реакции на пост', { postId });

		await Promise.all([this.cache.del(PostCacheKeys.detail(postId)), this.cache.delByPattern(PostCacheKeys.LIST)]);
	}
}
