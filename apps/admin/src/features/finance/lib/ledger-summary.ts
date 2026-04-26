import { LedgerEntryDirectionEnum } from '@pif/shared';
import { AdminLedgerEntryRow } from '../../../entities/finance';

export interface LedgerMonthSummary {
	incomeKopecks: number;
	expenseKopecks: number;
	balanceKopecks: number;
}

export const summarizeLedgerMonth = (rows: AdminLedgerEntryRow[]): LedgerMonthSummary => {
	let incomeKopecks = 0;
	let expenseKopecks = 0;
	for (const row of rows) {
		if (row.direction === LedgerEntryDirectionEnum.INCOME) {
			incomeKopecks += row.netAmount;
		} else {
			expenseKopecks += row.netAmount;
		}
	}
	return {
		incomeKopecks,
		expenseKopecks,
		balanceKopecks: incomeKopecks - expenseKopecks
	};
};

export const groupLedgerRowsByDay = (rows: AdminLedgerEntryRow[]): Map<string, AdminLedgerEntryRow[]> => {
	const map = new Map<string, AdminLedgerEntryRow[]>();
	const sorted = [...rows].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
	for (const row of sorted) {
		const key = row.occurredAt.slice(0, 10);
		const list = map.get(key) ?? [];
		list.push(row);
		map.set(key, list);
	}
	return map;
};
