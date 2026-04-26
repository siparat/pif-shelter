import {
	createManualExpenseRequestSchema,
	createManualExpenseResponseSchema,
	deleteManualExpenseResponseSchema,
	generateMonthlyFinanceReportRequestSchema,
	generateMonthlyFinanceReportResponseSchema,
	listLedgerForMonthQuerySchema,
	listLedgerForMonthResponseSchema,
	publicMonthlyLedgerExcelUrlQuerySchema,
	publicMonthlyLedgerExcelUrlResponseSchema,
	updateManualExpenseRequestSchema,
	updateManualExpenseResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type ListLedgerForMonthParams = z.infer<typeof listLedgerForMonthQuerySchema>;
export type AdminLedgerEntryRow = z.infer<typeof listLedgerForMonthResponseSchema>['data'][number];

export type CreateManualExpensePayload = z.infer<typeof createManualExpenseRequestSchema>;
export type CreateManualExpenseResult = z.infer<typeof createManualExpenseResponseSchema>['data'];

export type UpdateManualExpensePayload = z.infer<typeof updateManualExpenseRequestSchema>;
export type UpdateManualExpenseResult = z.infer<typeof updateManualExpenseResponseSchema>['data'];

export type DeleteManualExpenseResult = z.infer<typeof deleteManualExpenseResponseSchema>['data'];

export type GenerateMonthlyReportPayload = z.infer<typeof generateMonthlyFinanceReportRequestSchema>;
export type GenerateMonthlyReportResult = z.infer<typeof generateMonthlyFinanceReportResponseSchema>['data'];

export type PublicMonthlyLedgerExcelParams = z.infer<typeof publicMonthlyLedgerExcelUrlQuerySchema>;
export type PublicMonthlyLedgerExcelResult = z.infer<typeof publicMonthlyLedgerExcelUrlResponseSchema>['data'];
