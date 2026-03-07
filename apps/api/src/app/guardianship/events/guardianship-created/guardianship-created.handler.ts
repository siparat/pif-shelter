import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { GuardianshipCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipCreatedEvent } from './guardianship-created.event';

@EventsHandler(GuardianshipCreatedEvent)
export class GuardianshipCreatedHandler implements IEventHandler<GuardianshipCreatedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ guardianship }: GuardianshipCreatedEvent): Promise<void> {
		await Promise.all([
			this.cache.del(GuardianshipCacheKeys.byAnimal(guardianship.animalId)).catch(() => undefined),
			this.cache.del(GuardianshipCacheKeys.activeByUserId(guardianship.guardianUserId)).catch(() => undefined)
		]);
		this.logger.log('Кэш опекунства по животному сброшен', { animalId: guardianship.animalId });
	}
}
