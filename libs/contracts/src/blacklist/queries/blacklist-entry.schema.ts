import { BlacklistContext, BlacklistSource, BlacklistStatus } from '@pif/shared';
import { z } from 'zod';

export const blacklistEntrySchema = z.object({
	id: z.uuid(),
	context: z.enum(BlacklistContext),
	source: z.enum(BlacklistSource),
	value: z.string(),
	reason: z.string().nullable(),
	status: z.enum(BlacklistStatus),
	moderatorId: z.string().nullable(),
	expiredAt: z.iso.datetime().nullable(),
	blockedAt: z.iso.datetime().nullable(),
	appealedAt: z.iso.datetime().nullable(),
	addedAt: z.iso.datetime().nullable()
});

export type BlacklistEntry = z.infer<typeof blacklistEntrySchema>;
