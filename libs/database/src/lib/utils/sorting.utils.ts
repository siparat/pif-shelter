import { Columns, getColumns, Table, TableConfig } from 'drizzle-orm';
import { ISortOrder } from '../interfaces/sorting.interface';

export function getSortOrder(
	sort: string | undefined,
	table: Table<TableConfig<Columns>>,
	defaultOrder: ISortOrder
): ISortOrder {
	const columns = getColumns(table);
	if (sort) {
		const [field, direction] = sort.split(':');
		if (field && field in columns && (direction === 'asc' || direction === 'desc')) {
			return { direction, column: field };
		}
	}
	return defaultOrder;
}
