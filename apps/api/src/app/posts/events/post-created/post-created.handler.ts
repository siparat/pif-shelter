import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { PostCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostCreatedEvent } from './post-created.event';

@EventsHandler(PostCreatedEvent)
export class PostCreatedHandler implements IEventHandler<PostCreatedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ post }: PostCreatedEvent): Promise<void> {
		const postId = post.id || '';
		await Promise.all([this.cache.del(PostCacheKeys.detail(postId)), this.cache.delByPattern(PostCacheKeys.LIST)]);

		this.logger.log('Сброс кэша после создания поста', { postId });
	}
}
