import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalLabelDeletedEvent } from './animal-label-deleted.event';

@EventsHandler(AnimalLabelDeletedEvent)
export class AnimalLabelDeletedHandler implements IEventHandler<AnimalLabelDeletedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ labelId }: AnimalLabelDeletedEvent): Promise<void> {
		this.logger.log('Сброс кэша после удаления ярлыка', { labelId });

		await Promise.all([this.cache.del(AnimalCacheKeys.LABELS_LIST)]);
	}
}
