import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalLabelUnassignedEvent } from './animal-label-unassigned.event';

@EventsHandler(AnimalLabelUnassignedEvent)
export class AnimalLabelUnassignedHandler implements IEventHandler<AnimalLabelUnassignedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ animalId }: AnimalLabelUnassignedEvent): Promise<void> {
		this.logger.log('Сброс кэша после отвязки ярлыка', { animalId });

		await Promise.all([
			this.cache.del(AnimalCacheKeys.detail(animalId)),
			this.cache.delByPattern(AnimalCacheKeys.LIST)
		]);
	}
}
