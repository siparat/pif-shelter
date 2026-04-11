import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { BlacklistCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { ContactDeletedFromBlacklistEvent } from '../contact-deleted-from-blacklist/contact-deleted-from-blacklist.event';
import { ContactsApprovedEvent } from '../contacts-approved/contacts-approved.event';
import { ContactsBannedEvent } from '../contacts-banned/contacts-banned.event';
import { ContactsSuspectedEvent } from '../contacts-suspected/contacts-suspected.event';

@EventsHandler(ContactsApprovedEvent, ContactsBannedEvent, ContactsSuspectedEvent, ContactDeletedFromBlacklistEvent)
export class BlacklistCacheInvalidateHandler implements IEventHandler {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle(): Promise<void> {
		await Promise.all([
			this.cache.delByPattern(`${BlacklistCacheKeys.LIST}:*`),
			this.cache.delByPattern(`${BlacklistCacheKeys.DETAIL_PATTERN}:*`)
		]).catch(() => undefined);
		this.logger.log('Кэш черного списка сброшен');
	}
}
