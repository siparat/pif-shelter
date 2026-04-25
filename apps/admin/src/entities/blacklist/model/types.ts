import {
	approveContactsResponseSchema,
	banContactsRequestSchema,
	banContactsResponseSchema,
	deleteContactFromBlacklistResponseSchema,
	listBlacklistQuerySchema,
	listBlacklistResponseSchema,
	suspectContactsRequestSchema,
	suspectContactsResponseSchema
} from '@pif/contracts';
import { z } from 'zod';

export type BlacklistListParams = z.input<typeof listBlacklistQuerySchema>;
export type BlacklistListData = Omit<z.infer<typeof listBlacklistResponseSchema>, 'success'>;
export type BlacklistEntry = BlacklistListData['data'][number];

export type BanContactsPayload = z.input<typeof banContactsRequestSchema>;
export type BanContactsResult = z.infer<typeof banContactsResponseSchema>['data'];

export type SuspectContactsPayload = z.input<typeof suspectContactsRequestSchema>;
export type SuspectContactsResult = z.infer<typeof suspectContactsResponseSchema>['data'];

export type ApproveContactsResult = z.infer<typeof approveContactsResponseSchema>['data'];
export type DeleteContactResult = z.infer<typeof deleteContactFromBlacklistResponseSchema>['data'];
