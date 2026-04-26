import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	createManualExpense,
	deleteManualExpense,
	generateMonthlyFinanceReport,
	getMonthlyLedger,
	getPublicMonthlyLedgerExcelUrl,
	updateManualExpense
} from '../api/finance.api';
import {
	CreateManualExpensePayload,
	GenerateMonthlyReportPayload,
	ListLedgerForMonthParams,
	PublicMonthlyLedgerExcelParams,
	UpdateManualExpensePayload
} from './types';

export const financeQueryKeys = {
	root: ['finance'] as const,
	ledger: (p: ListLedgerForMonthParams) => [...financeQueryKeys.root, 'ledger', p.year, p.month] as const,
	excelUrl: (p: PublicMonthlyLedgerExcelParams) => [...financeQueryKeys.root, 'excel-url', p.year, p.month] as const
};

export const useMonthlyLedgerQuery = (params: ListLedgerForMonthParams, options?: { enabled?: boolean }) =>
	useQuery({
		queryKey: financeQueryKeys.ledger(params),
		queryFn: () => getMonthlyLedger(params),
		enabled: options?.enabled ?? true
	});

export const usePublicMonthlyLedgerExcelUrlQuery = (
	params: PublicMonthlyLedgerExcelParams,
	options?: { enabled?: boolean }
) =>
	useQuery({
		queryKey: financeQueryKeys.excelUrl(params),
		queryFn: () => getPublicMonthlyLedgerExcelUrl(params),
		enabled: options?.enabled ?? true,
		retry: 1
	});

export const useCreateManualExpenseMutation = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateManualExpensePayload) => createManualExpense(payload),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: financeQueryKeys.root });
		}
	});
};

export const useUpdateManualExpenseMutation = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateManualExpensePayload) => updateManualExpense(payload),
		onSuccess: async (_data, variables) => {
			await qc.invalidateQueries({ queryKey: financeQueryKeys.root });
		}
	});
};

export const useDeleteManualExpenseMutation = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteManualExpense(id),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: financeQueryKeys.root });
		}
	});
};

export const useGenerateMonthlyFinanceReportMutation = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (payload: GenerateMonthlyReportPayload) => generateMonthlyFinanceReport(payload),
		onSuccess: async (_data, variables) => {
			await qc.invalidateQueries({
				queryKey: financeQueryKeys.excelUrl({ year: variables.year, month: variables.month })
			});
			await qc.invalidateQueries({
				queryKey: financeQueryKeys.ledger({ year: variables.year, month: variables.month })
			});
		}
	});
};
