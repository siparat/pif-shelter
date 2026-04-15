import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { listLedgerForMonthQuerySchema } from './get-monthly-ledger.query';

export const publicMonthlyLedgerExcelUrlQuerySchema = listLedgerForMonthQuerySchema;

export const publicMonthlyLedgerExcelUrlResponseSchema = createApiSuccessResponseSchema(
	z.object({
		url: z.url(),
		storageKey: z.string()
	})
);
