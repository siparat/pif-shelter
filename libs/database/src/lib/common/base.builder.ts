import { AnyColumn, eq, SQL } from 'drizzle-orm';
import { IBuiltFilters, OrmCondition } from '../interfaces/builder.interface';

export abstract class BaseBuilder<TDto, TSchema> {
	protected ormConditions: OrmCondition[] = [];
	protected sqlConditions: SQL[] = [];

	constructor(protected readonly table: TSchema) {}

	protected addExactMatch<K extends keyof TDto>(field: K, value: TDto[K] | undefined, column: AnyColumn): this {
		if (value !== undefined) {
			this.ormConditions.push({ [String(field)]: value });
			this.sqlConditions.push(eq(column, value));
		}
		return this;
	}

	public build(): IBuiltFilters {
		return {
			orm: this.ormConditions.length > 0 ? { AND: this.ormConditions } : {},
			sql: this.sqlConditions
		};
	}
}
