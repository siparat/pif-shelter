import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { createApiSuccessResponseSchema } from '../common/base.responses';

const manualExpenseAmountKopecksSchema = z
	.number()
	.int('Сумма в целых копейках')
	.positive('Сумма расхода должна быть больше нуля')
	.max(10_000_000_00, 'Сумма расхода не может быть больше 10 000 000 рублей, используйте несколько платежей');

export const createManualExpenseRequestSchema = z.object({
	amount: manualExpenseAmountKopecksSchema,
	occurredAt: z.iso.datetime().describe('Момент расхода для отчёта за месяц'),
	title: z.string().trim().min(1).max(200),
	note: z.string().trim().max(2000).optional(),
	receiptStorageKey: z.string().trim().min(1).describe('Ключ объекта чека в S3')
});

export class CreateManualExpenseRequestDto extends createZodDto(createManualExpenseRequestSchema) {}

export const createManualExpenseResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);

export class CreateManualExpenseResponseDto extends createZodDto(createManualExpenseResponseSchema) {}

export const updateManualExpenseRequestSchema = z
	.object({
		id: z.uuid(),
		amount: manualExpenseAmountKopecksSchema.optional(),
		occurredAt: z.iso.datetime().optional(),
		title: z.string().trim().min(1).max(200).optional(),
		note: z.string().trim().max(2000).nullable().optional(),
		receiptStorageKey: z.string().trim().min(1).optional()
	})
	.refine(
		(v) =>
			v.amount !== undefined ||
			v.occurredAt !== undefined ||
			v.title !== undefined ||
			v.note !== undefined ||
			v.receiptStorageKey !== undefined,
		{ message: 'Укажите хотя бы одно поле для обновления' }
	);

export class UpdateManualExpenseRequestDto extends createZodDto(updateManualExpenseRequestSchema) {}

export const updateManualExpenseResponseSchema = createApiSuccessResponseSchema(
	z.object({
		id: z.uuid()
	})
);

export class UpdateManualExpenseResponseDto extends createZodDto(updateManualExpenseResponseSchema) {}

export const deleteManualExpenseRequestSchema = z.object({
	id: z.uuid()
});

export class DeleteManualExpenseRequestDto extends createZodDto(deleteManualExpenseRequestSchema) {}

export const deleteManualExpenseResponseSchema = createApiSuccessResponseSchema(
	z.object({
		success: z.literal(true)
	})
);

export class DeleteManualExpenseResponseDto extends createZodDto(deleteManualExpenseResponseSchema) {}

export const adminLedgerEntryRowSchema = z.object({
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
	donorDisplayName: z.string().nullable(),
	providerPaymentId: z.string().nullable(),
	donationOneTimeIntentId: z.uuid().nullable(),
	donationSubscriptionId: z.uuid().nullable(),
	guardianshipId: z.uuid().nullable(),
	receiptStorageKey: z.string().nullable(),
	createdByUserId: z.string().nullable()
});

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
	receiptStorageKey: z.string().nullable()
});

export const listLedgerForMonthQuerySchema = z.object({
	year: z.coerce.number().int().min(2000).max(2100),
	month: z.coerce.number().int().min(1).max(12)
});

export class ListLedgerForMonthQueryDto extends createZodDto(listLedgerForMonthQuerySchema) {}

export const listLedgerForMonthResponseSchema = createApiSuccessResponseSchema(z.array(adminLedgerEntryRowSchema));

export class ListLedgerForMonthResponseDto extends createZodDto(listLedgerForMonthResponseSchema) {}

export const publicLedgerReportQuerySchema = listLedgerForMonthQuerySchema;

export class PublicLedgerReportQueryDto extends createZodDto(publicLedgerReportQuerySchema) {}

export const publicLedgerReportResponseSchema = createApiSuccessResponseSchema(z.array(publicLedgerReportEntrySchema));

export class PublicLedgerReportResponseDto extends createZodDto(publicLedgerReportResponseSchema) {}
