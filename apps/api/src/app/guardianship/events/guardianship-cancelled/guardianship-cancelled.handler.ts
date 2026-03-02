import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { GuardianshipCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from './guardianship-cancelled.event';

@EventsHandler(GuardianshipCancelledEvent)
export class GuardianshipCancelledHandler implements IEventHandler<GuardianshipCancelledEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ animalId }: GuardianshipCancelledEvent): Promise<void> {
		await this.cache.del(GuardianshipCacheKeys.byAnimal(animalId)).catch(() => undefined);
		this.logger.log('Кэш опекунства по животному сброшен после отмены', { animalId });
	}
}
