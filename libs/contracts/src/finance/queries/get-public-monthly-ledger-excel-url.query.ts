import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { listLedgerForMonthQuerySchema } from './get-monthly-ledger.query';

export const publicMonthlyLedgerExcelUrlQuerySchema = listLedgerForMonthQuerySchema;
export class PublicMonthlyLedgerExcelUrlQueryDto extends createZodDto(publicMonthlyLedgerExcelUrlQuerySchema) {}

export const publicMonthlyLedgerExcelUrlResponseSchema = createApiSuccessResponseSchema(
	z.object({
		url: z.url(),
		storageKey: z.string()
	})
);
export class PublicMonthlyLedgerExcelUrlResponseDto extends createZodDto(publicMonthlyLedgerExcelUrlResponseSchema) {}
