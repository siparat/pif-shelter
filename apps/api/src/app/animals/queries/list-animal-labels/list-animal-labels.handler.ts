import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalLabel, DatabaseService, animalLabelColumns } from '@pif/database';
import { ListAnimalLabelsQuery } from './list-animal-labels.query';
import { AnimalCacheKeys } from '@pif/shared';

@QueryHandler(ListAnimalLabelsQuery)
export class ListAnimalLabelsHandler implements IQueryHandler<ListAnimalLabelsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute(): Promise<AnimalLabel[]> {
		const cached = await this.cache.get<AnimalLabel[]>(AnimalCacheKeys.LABELS_LIST).catch(() => null);
		if (cached) {
			return cached;
		}

		const labels = await this.db.client.query.animalLabels.findMany({
			columns: animalLabelColumns,
			orderBy: { name: 'asc' }
		});

		await this.cache.set(AnimalCacheKeys.LABELS_LIST, labels).catch(() => undefined);

		return labels;
	}
}
