import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalCuratorSetEvent } from './animal-curator-set.event';

@EventsHandler(AnimalCuratorSetEvent)
export class AnimalCuratorSetHandler implements IEventHandler<AnimalCuratorSetEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ animalId }: AnimalCuratorSetEvent): Promise<void> {
		this.logger.log('Сброс кэша после смены куратора', { animalId });

		await Promise.all([
			this.cache.del(AnimalCacheKeys.detail(animalId)),
			this.cache.delByPattern(AnimalCacheKeys.LIST)
		]);
	}
}
