import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalCacheKeys } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { AnimalLabelCreatedEvent } from './animal-label-created.event';

@EventsHandler(AnimalLabelCreatedEvent)
export class AnimalLabelCreatedHandler implements IEventHandler<AnimalLabelCreatedEvent> {
	constructor(
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {}

	async handle({ labelId }: AnimalLabelCreatedEvent): Promise<void> {
		this.logger.log('Сброс кэша после создания ярлыка', { labelId });

		await Promise.all([this.cache.del(AnimalCacheKeys.LABELS_LIST)]);
	}
}
