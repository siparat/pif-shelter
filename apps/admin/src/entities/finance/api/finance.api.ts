import {
	createManualExpenseResponseSchema,
	deleteManualExpenseResponseSchema,
	generateMonthlyFinanceReportResponseSchema,
	listLedgerForMonthResponseSchema,
	publicMonthlyLedgerExcelUrlResponseSchema,
	updateManualExpenseResponseSchema
} from '@pif/contracts';
import { z } from 'zod';
import { api } from '../../../shared/api';
import {
	AdminLedgerEntryRow,
	CreateManualExpensePayload,
	CreateManualExpenseResult,
	DeleteManualExpenseResult,
	GenerateMonthlyReportPayload,
	GenerateMonthlyReportResult,
	ListLedgerForMonthParams,
	PublicMonthlyLedgerExcelParams,
	PublicMonthlyLedgerExcelResult,
	UpdateManualExpensePayload,
	UpdateManualExpenseResult
} from '../model/types';

type ListLedgerResponse = z.infer<typeof listLedgerForMonthResponseSchema>;
type CreateResponse = z.infer<typeof createManualExpenseResponseSchema>;
type UpdateResponse = z.infer<typeof updateManualExpenseResponseSchema>;
type DeleteResponse = z.infer<typeof deleteManualExpenseResponseSchema>;
type GenerateResponse = z.infer<typeof generateMonthlyFinanceReportResponseSchema>;
type ExcelUrlResponse = z.infer<typeof publicMonthlyLedgerExcelUrlResponseSchema>;

const ledgerSearchParams = (params: ListLedgerForMonthParams): Record<string, string> => ({
	year: String(params.year),
	month: String(params.month)
});

export const getMonthlyLedger = async (params: ListLedgerForMonthParams): Promise<AdminLedgerEntryRow[]> => {
	const response = await api
		.get('finance/monthly-ledger', { searchParams: ledgerSearchParams(params) })
		.json<ListLedgerResponse>();
	return response.data;
};

export const createManualExpense = async (payload: CreateManualExpensePayload): Promise<CreateManualExpenseResult> => {
	const response = await api.post('finance/manual-expenses', { json: payload }).json<CreateResponse>();
	return response.data;
};

export const updateManualExpense = async (payload: UpdateManualExpensePayload): Promise<UpdateManualExpenseResult> => {
	const response = await api.patch('finance/manual-expenses', { json: payload }).json<UpdateResponse>();
	return response.data;
};

export const deleteManualExpense = async (id: string): Promise<DeleteManualExpenseResult> => {
	const response = await api.delete(`finance/manual-expenses/${id}`).json<DeleteResponse>();
	return response.data;
};

export const getPublicMonthlyLedgerExcelUrl = async (
	params: PublicMonthlyLedgerExcelParams
): Promise<PublicMonthlyLedgerExcelResult> => {
	const response = await api
		.get('finance/public/monthly-ledger/excel', { searchParams: ledgerSearchParams(params) })
		.json<ExcelUrlResponse>();
	return response.data;
};

export const generateMonthlyFinanceReport = async (
	payload: GenerateMonthlyReportPayload
): Promise<GenerateMonthlyReportResult> => {
	const response = await api
		.post('finance/monthly-ledger/excel/generate', { json: payload })
		.json<GenerateResponse>();
	return response.data;
};
