import { BlacklistSource } from '@pif/shared';
import z from 'zod';
import { phoneSchema, telegramNicknameSchema } from '../../common';

const phoneBlacklistSourceSchema = z.object({
	source: z.literal(BlacklistSource.PHONE),
	value: phoneSchema
});

const emailBlacklistSourceSchema = z.object({
	source: z.literal(BlacklistSource.EMAIL),
	value: z.email().trim().toLowerCase()
});

const telegramBlacklistSourceSchema = z.object({
	source: z.literal(BlacklistSource.TELEGRAM),
	value: telegramNicknameSchema
});

export const blacklistSourceSchema = z.discriminatedUnion('source', [
	phoneBlacklistSourceSchema,
	emailBlacklistSourceSchema,
	telegramBlacklistSourceSchema
]);
