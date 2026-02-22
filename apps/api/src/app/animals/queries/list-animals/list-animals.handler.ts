import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAnimalsResult } from '@pif/contracts';
import { animals, DatabaseService, getSortOrder } from '@pif/database';
import { and, count } from 'drizzle-orm';
import { ListAnimalsBuilder } from './list-animals.builder';
import { ListAnimalsQuery } from './list-animals.query';

@QueryHandler(ListAnimalsQuery)
export class ListAnimalsHandler implements IQueryHandler<ListAnimalsQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({ dto }: ListAnimalsQuery): Promise<ListAnimalsResult> {
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
				columns: {
					description: false,
					galleryUrls: false
				}
			}),
			this.db.client
				.select({ count: count() })
				.from(animals)
				.where(and(...sql))
		]);

		const total = totalResult.count;
		const totalPages = Math.ceil(total / perPage);

		return {
			data,
			meta: {
				total,
				page,
				perPage,
				totalPages
			}
		};
	}
}
