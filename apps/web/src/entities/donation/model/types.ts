import { z } from 'zod';
import {
	createDonationSubscriptionRequestSchema,
	createOneTimeDonationRequestSchema,
	publicLedgerReportEntrySchema,
	publicLedgerReportQuerySchema
} from '@pif/contracts';

export type PublicLedgerReportQuery = z.infer<typeof publicLedgerReportQuerySchema>;

export type PublicLedgerReportRow = z.infer<typeof publicLedgerReportEntrySchema>;

export type CreateOneTimeDonationRequest = z.infer<typeof createOneTimeDonationRequestSchema>;

export type CreateDonationSubscriptionRequest = z.infer<typeof createDonationSubscriptionRequestSchema>;
