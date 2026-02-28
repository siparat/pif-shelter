import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { AnimalLabel, DatabaseService, animalLabelColumns } from '@pif/database';
import { ListAnimalLabelsQuery } from './list-animal-labels.query';

@QueryHandler(ListAnimalLabelsQuery)
export class ListAnimalLabelsHandler implements IQueryHandler<ListAnimalLabelsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute(): Promise<AnimalLabel[]> {
		const cacheKey = 'animals:labels:list';
		const cached = await this.cache.get<AnimalLabel[]>(cacheKey).catch(() => null);
		if (cached) {
			return cached;
		}

		const labels = await this.db.client.query.animalLabels.findMany({
			columns: animalLabelColumns,
			orderBy: { name: 'asc' }
		});

		await this.cache.set(cacheKey, labels).catch(() => undefined);

		return labels;
	}
}
