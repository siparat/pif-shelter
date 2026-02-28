import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CacheService } from '@pif/cache';
import { ListAnimalsResult } from '@pif/contracts';
import { animals, DatabaseService, getSortOrder, animalListColumns } from '@pif/database';
import { and, count } from 'drizzle-orm';
import { ListAnimalsBuilder } from './list-animals.builder';
import { ListAnimalsQuery } from './list-animals.query';

@QueryHandler(ListAnimalsQuery)
export class ListAnimalsHandler implements IQueryHandler<ListAnimalsQuery> {
	constructor(
		private readonly db: DatabaseService,
		private readonly cache: CacheService
	) {}

	async execute({ dto }: ListAnimalsQuery): Promise<ListAnimalsResult> {
		const queryHash = this.cache.buildQueryKey('animals:list', dto);
		const cached = await this.cache.get<ListAnimalsResult>(queryHash).catch(() => null);
		if (cached) {
			return cached;
		}

		const { page = 1, perPage = 20, q, sort } = dto;
		const { sql, orm } = new ListAnimalsBuilder(animals)
			.setSearchTerm(q)
			.setStatus(dto.status)
			.setSpecies(dto.species)
			.setGender(dto.gender)
			.setSize(dto.size)
			.setCoat(dto.coat)
			.setIsSterilized(dto.isSterilized)
			.setIsVaccinated(dto.isVaccinated)
			.setIsParasiteTreated(dto.isParasiteTreated)
			.setAgeRange(dto.minAge, dto.maxAge)
			.build();

		const orderBy = getSortOrder(sort, animals, { column: 'createdAt', direction: 'desc' });

		const [data, [totalResult]] = await Promise.all([
			this.db.client.query.animals.findMany({
				where: orm as any,
				limit: perPage,
				offset: perPage * (page - 1),
				orderBy: { [orderBy.column]: orderBy.direction },
				with: { labels: true },
				columns: animalListColumns
			}),
			this.db.client
				.select({ count: count() })
				.from(animals)
				.where(and(...sql))
		]);

		const total = totalResult.count;
		const totalPages = Math.ceil(total / perPage);

		const result: ListAnimalsResult = {
			data,
			meta: {
				total,
				page,
				perPage,
				totalPages
			}
		};

		await this.cache.set(queryHash, result).catch(() => undefined);
		return result;
	}
}
