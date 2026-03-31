import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { listLedgerForMonthQuerySchema } from './get-monthly-ledger.query';

export const publicLedgerReportEntrySchema = z.object({
	id: z.uuid(),
	direction: z.enum(LedgerEntryDirectionEnum),
	source: z.enum(LedgerEntrySourceEnum),
	grossAmount: z.number().int(),
	feeAmount: z.number().int(),
	netAmount: z.number().int(),
	currency: z.string(),
	occurredAt: z.iso.datetime(),
	title: z.string(),
	note: z.string().nullable(),
	donorDisplayName: z
		.string()
		.nullable()
		.optional()
		.describe(
			'Имя донора для публичного отчёта: отсутствует или null, если скрыто флагом hide_public_name у источника'
		),
	campaignId: z.uuid().nullable(),
	campaignTitle: z.string().nullable(),
	receiptStorageKey: z.string().nullable()
});

export const publicLedgerReportQuerySchema = listLedgerForMonthQuerySchema;

export class PublicLedgerReportQueryDto extends createZodDto(publicLedgerReportQuerySchema) {}

export const publicLedgerReportResponseSchema = createApiSuccessResponseSchema(z.array(publicLedgerReportEntrySchema));

export class PublicLedgerReportResponseDto extends createZodDto(publicLedgerReportResponseSchema) {}
