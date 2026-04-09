import { BlacklistSource } from '@pif/shared';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { phoneSchema, telegramNicknameSchema } from '../../common';
import { createApiSuccessResponseSchema } from '../../common/base.responses';

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

export const banContactsRequestSchema = z.object({
	reason: z.string().trim().min(2).max(1000),
	sources: z.array(blacklistSourceSchema).min(1)
});

export class BanContactsRequestDto extends createZodDto(banContactsRequestSchema) {}

export const banContactsResponseSchema = createApiSuccessResponseSchema(
	z.object({
		updated: z.number().int().nonnegative()
	})
);

export class BanContactsResponseDto extends createZodDto(banContactsResponseSchema) {}
