export const LedgerCacheKeys = {
	monthPublic: (year: number, month: number): string =>
		`ledger:month:${year}-${month.toString().padStart(2, '0')}:public`,
	monthInternal: (year: number, month: number): string =>
		`ledger:month:${year}-${month.toString().padStart(2, '0')}:internal`
} satisfies Record<string, string | ((...args: any[]) => string)>;
