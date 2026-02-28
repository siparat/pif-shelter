import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalLabelAssignedEvent } from './animal-label-assigned.event';

@EventsHandler(AnimalLabelAssignedEvent)
export class AnimalLabelAssignedHandler implements IEventHandler<AnimalLabelAssignedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ animalId }: AnimalLabelAssignedEvent): Promise<void> {
		this.logger.log('Сброс кэша после привязки ярлыка', { animalId });

		await Promise.all([
			this.cache.del(AnimalCacheKeys.detail(animalId)),
			this.cache.delByPattern(AnimalCacheKeys.LIST)
		]);
	}
}
