import { MeetingRequestStatusEnum } from '@pif/shared';
import z from 'zod';

export const meetingRequestResponseSchema = z.object({
	id: z.uuid(),
	animalId: z.uuid(),
	curatorUserId: z.string(),
	name: z.string(),
	phone: z.string(),
	email: z.string().nullable(),
	comment: z.string().nullable(),
	meetingAt: z.iso.datetime(),
	status: z.enum(MeetingRequestStatusEnum),
	confirmedAt: z.iso.datetime().nullable(),
	rejectedAt: z.iso.datetime().nullable(),
	rejectionReason: z.string().nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime().nullish(),
	animal: z.object({
		id: z.uuid(),
		name: z.string(),
		avatarUrl: z.string().nullable()
	}),
	curator: z.object({
		id: z.string(),
		name: z.string().nullable(),
		email: z.string().nullable()
	})
});

export type MeetingRequestResponse = z.infer<typeof meetingRequestResponseSchema>;
