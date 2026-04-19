import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalCostOfGuardianshipSetEvent } from './animal-cost-of-guardianship-set/animal-cost-of-guardianship-set.event';
import { AnimalCreatedEvent } from './animal-created/animal-created.event';
import { AnimalCuratorSetEvent } from './animal-curator-set/animal-curator-set.event';
import { AnimalLabelUnassignedEvent } from './animal-label-unassigned/animal-label-unassigned.event';
import { AnimalStatusChangedEvent } from './animal-status-changed/animal-status-changed.event';
import { AnimalUpdatedEvent } from './animal-updated/animal-updated.event';

@EventsHandler(
	AnimalUpdatedEvent,
	AnimalStatusChangedEvent,
	AnimalLabelUnassignedEvent,
	AnimalCuratorSetEvent,
	AnimalCreatedEvent,
	AnimalCostOfGuardianshipSetEvent
)
export class InvalidateAnimalsCacheHandler implements IEventHandler<{ animalId: string }> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ animalId }: { animalId: string }): Promise<void> {
		this.logger.log('Сброс кэша после изменения животного', { animalId });

		await Promise.all([
			this.cache.del(AnimalCacheKeys.detail(animalId)),
			this.cache.delByPattern(AnimalCacheKeys.LIST)
		]);
	}
}
