import { ListAnimalsRequestDto } from '@pif/contracts';
import { Animal, BaseBuilder, OrmCondition, TableSchema } from '@pif/database';
import { AnimalCoatEnum, AnimalGenderEnum, AnimalSizeEnum, AnimalSpeciesEnum, AnimalStatusEnum } from '@pif/shared';
import dayjs from 'dayjs';
import { and, gte, ilike, lte, or, SQL } from 'drizzle-orm';

export class ListAnimalsBuilder extends BaseBuilder<ListAnimalsRequestDto, TableSchema<Animal>> {
	public setSearchTerm(q?: string): this {
		if (q) {
			const searchTerm = `%${q}%`;

			this.ormConditions.push({
				OR: [
					{ name: { ilike: searchTerm } },
					{ description: { ilike: searchTerm } },
					{ color: { ilike: searchTerm } }
				]
			});

			const searchSqlCondition = or(
				ilike(this.table.name, searchTerm),
				ilike(this.table.description, searchTerm),
				ilike(this.table.color, searchTerm)
			);

			if (searchSqlCondition) {
				this.sqlConditions.push(searchSqlCondition);
			}
		}
		return this;
	}

	public setAgeRange(minAge?: number, maxAge?: number): this {
		if (minAge !== undefined || maxAge !== undefined) {
			const birthDateOrmConditions: OrmCondition[] = [];
			const birthDateSqlConditions: (SQL | undefined)[] = [];

			if (minAge !== undefined) {
				const maxDate = dayjs().subtract(minAge, 'year').toISOString();
				birthDateOrmConditions.push({ lte: maxDate });
				birthDateSqlConditions.push(lte(this.table.birthDate, maxDate));
			}

			if (maxAge !== undefined) {
				const minDate = dayjs().subtract(maxAge, 'year').toISOString();
				birthDateOrmConditions.push({ gte: minDate });
				birthDateSqlConditions.push(gte(this.table.birthDate, minDate));
			}

			this.ormConditions.push({ birthDate: { AND: birthDateOrmConditions } });

			const combinedSqlDateCondition = and(...birthDateSqlConditions);
			if (combinedSqlDateCondition) {
				this.sqlConditions.push(combinedSqlDateCondition);
			}
		}
		return this;
	}

	public setStatus(status?: AnimalStatusEnum): this {
		return this.addExactMatch('status', status, this.table.status);
	}

	public setSpecies(species?: AnimalSpeciesEnum): this {
		return this.addExactMatch('species', species, this.table.species);
	}

	public setGender(gender?: AnimalGenderEnum): this {
		return this.addExactMatch('gender', gender, this.table.gender);
	}

	public setSize(size?: AnimalSizeEnum): this {
		return this.addExactMatch('size', size, this.table.size);
	}

	public setCoat(coat?: AnimalCoatEnum): this {
		return this.addExactMatch('coat', coat, this.table.coat);
	}

	public setIsSterilized(isSterilized?: boolean): this {
		return this.addExactMatch('isSterilized', isSterilized, this.table.isSterilized);
	}

	public setIsVaccinated(isVaccinated?: boolean): this {
		return this.addExactMatch('isVaccinated', isVaccinated, this.table.isVaccinated);
	}

	public setIsParasiteTreated(isParasiteTreated?: boolean): this {
		return this.addExactMatch('isParasiteTreated', isParasiteTreated, this.table.isParasiteTreated);
	}
}
