import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { GuardianshipCacheKeys } from '@pif/shared';
import { GuardianshipCreatedEvent } from './guardianship-created.event';
import { Logger } from 'nestjs-pino';

@EventsHandler(GuardianshipCreatedEvent)
export class GuardianshipCreatedHandler implements IEventHandler<GuardianshipCreatedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ animalId }: GuardianshipCreatedEvent): Promise<void> {
		await this.cache.del(GuardianshipCacheKeys.byAnimal(animalId)).catch(() => undefined);
		this.logger.log('Кэш опекунства по животному сброшен', { animalId });
	}
}
