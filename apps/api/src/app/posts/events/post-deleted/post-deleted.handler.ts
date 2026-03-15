import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { PostCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { PostDeletedEvent } from './post-deleted.event';

@EventsHandler(PostDeletedEvent)
export class PostDeletedHandler implements IEventHandler<PostDeletedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ postId }: PostDeletedEvent): Promise<void> {
		this.logger.log('Сброс кэша после удаления поста', { postId });

		await Promise.all([this.cache.del(PostCacheKeys.detail(postId)), this.cache.delByPattern(PostCacheKeys.LIST)]);
	}
}
