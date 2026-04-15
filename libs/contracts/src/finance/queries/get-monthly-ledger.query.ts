import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

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
	campaignId: z.uuid().nullable(),
	campaignTitle: z.string().nullable(),
	donationSubscriptionId: z.uuid().nullable(),
	guardianshipId: z.uuid().nullable(),
	receiptStorageKey: z.string().nullable(),
	createdByUserId: z.string().nullable()
});

export const listLedgerForMonthQuerySchema = z.object({
	year: z.coerce.number().int().min(2000).max(2100),
	month: z.coerce.number().int().min(1).max(12)
});

export const listLedgerForMonthResponseSchema = createApiSuccessResponseSchema(z.array(adminLedgerEntryRowSchema));
