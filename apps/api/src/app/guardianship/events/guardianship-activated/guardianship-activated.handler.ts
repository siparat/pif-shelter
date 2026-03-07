import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';
import { CacheService } from '@pif/cache';
import { Logger } from 'nestjs-pino';
import { GuardianshipCacheKeys } from '@pif/shared';

@EventsHandler(GuardianshipActivatedEvent)
export class GuardianshipActivatedHandler implements IEventHandler<GuardianshipActivatedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ guardianship }: GuardianshipActivatedEvent): Promise<void> {
		await Promise.all([
			this.cache.del(GuardianshipCacheKeys.byAnimal(guardianship.animalId)).catch(() => undefined),
			this.cache.del(GuardianshipCacheKeys.activeByUserId(guardianship.guardianUserId)).catch(() => undefined)
		]);

		this.logger.log('Кэш опекунства по животному сброшен после активации', { guardianship });
	}
}
