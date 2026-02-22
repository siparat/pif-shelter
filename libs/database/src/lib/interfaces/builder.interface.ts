import { AnyColumn, SQL } from 'drizzle-orm';

export type OrmCondition =
	| { [key: string]: string | number | boolean | undefined | null | OrmCondition | OrmCondition[] }
	| { OR?: OrmCondition[] }
	| { AND?: OrmCondition[] }
	| { ilike?: string }
	| { lte?: string; gte?: string };

export interface IBuiltFilters {
	orm: { AND?: OrmCondition[] } | Record<string, never>;
	sql: SQL[];
}

export type TableSchema<T extends Record<string, unknown>> = {
	[Key in keyof T]: AnyColumn;
};
