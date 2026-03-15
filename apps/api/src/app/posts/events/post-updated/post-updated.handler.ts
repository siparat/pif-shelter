import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { PostCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostUpdatedEvent } from './post-updated.event';

@EventsHandler(PostUpdatedEvent)
export class PostUpdatedHandler implements IEventHandler<PostUpdatedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ post }: PostUpdatedEvent): Promise<void> {
		const postId = post.id || '';
		this.logger.log('Сброс кэша после обновления поста', { postId });

		await Promise.all([this.cache.del(PostCacheKeys.detail(postId)), this.cache.delByPattern(PostCacheKeys.LIST)]);
	}
}
