import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { WishlistCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { WishlistDataChangedEvent } from './wishlist-data-changed.event';

@EventsHandler(WishlistDataChangedEvent)
export class WishlistCacheInvalidatedHandler implements IEventHandler<WishlistDataChangedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle(): Promise<void> {
		await this.cache.del(WishlistCacheKeys.PUBLIC).catch(() => undefined);
		this.logger.log('Кэш публичного wishlist сброшен');
	}
}
