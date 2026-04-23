import {
	cancelGuardianshipRequestSchema,
	getGuardianshipByAnimalResponseSchema,
	listGuardianshipsItemSchema,
	listGuardianshipsRequestSchema,
	ListGuardianshipsResult
} from '@pif/contracts';
import { z } from 'zod';

export type GuardianshipsListParams = z.input<typeof listGuardianshipsRequestSchema>;
export type GuardianshipsListData = ListGuardianshipsResult;
export type GuardianshipItem = z.infer<typeof listGuardianshipsItemSchema>;

export type GuardianshipDetails = z.infer<typeof getGuardianshipByAnimalResponseSchema>['data'];

export type CancelGuardianshipPayload = z.input<typeof cancelGuardianshipRequestSchema>;
