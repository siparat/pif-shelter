import { ListPostsRequestDto } from '@pif/contracts';
import { BaseBuilder, OrmCondition, posts } from '@pif/database';
import { and, gte, ilike, lte, or, SQL } from 'drizzle-orm';

export class ListPostsBuilder extends BaseBuilder<ListPostsRequestDto, typeof posts & Record<string, unknown>> {
	public setSearchTerm(q?: string): this {
		if (q) {
			const searchTerm = `%${q}%`;
			this.ormConditions.push({
				OR: [{ title: { ilike: searchTerm } }, { body: { ilike: searchTerm } }]
			});
			const searchSqlCondition = or(ilike(this.table.title, searchTerm), ilike(this.table.body, searchTerm));
			if (searchSqlCondition) {
				this.sqlConditions.push(searchSqlCondition);
			}
		}
		return this;
	}

	public setPostDateRange(minDate?: string, maxDate?: string): this {
		if (!minDate && !maxDate) {
			return this;
		}
		const birthDateOrmConditions: OrmCondition[] = [];
		const birthDateSqlConditions: (SQL | undefined)[] = [];

		if (minDate) {
			birthDateOrmConditions.push({ gte: minDate });
			birthDateSqlConditions.push(gte(this.table.createdAt, new Date(minDate)));
		}

		if (maxDate) {
			birthDateOrmConditions.push({ lte: maxDate });
			birthDateSqlConditions.push(lte(this.table.createdAt, new Date(maxDate)));
		}

		this.ormConditions.push({ createdAt: { AND: birthDateOrmConditions } });

		const combinedSqlDateCondition = and(...birthDateSqlConditions);
		if (combinedSqlDateCondition) {
			this.sqlConditions.push(combinedSqlDateCondition);
		}
		return this;
	}

	public setAnimalId(animalId?: string): this {
		return this.addExactMatch('animalId', animalId, this.table.animalId);
	}
}
