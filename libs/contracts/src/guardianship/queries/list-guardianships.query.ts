import { AnimalSpeciesEnum, GuardianshipStatusEnum } from '@pif/shared';
import { z } from 'zod';
import { createApiPaginatedResponseSchema } from '../../common';
import { paginationSchema } from '../../common/schemas/pagination.schema';

export const listGuardianshipsRequestSchema = paginationSchema.extend({
	status: z.enum(GuardianshipStatusEnum).optional().describe('Фильтр по статусу опекунства'),
	animalId: z.uuid().optional().describe('Фильтр по конкретному животному'),
	curatorId: z
		.string()
		.trim()
		.min(1)
		.optional()
		.describe('Фильтр по куратору животного (для VOLUNTEER проставляется автоматически в своего)'),
	guardianUserId: z.string().trim().min(1).optional().describe('Фильтр по опекуну')
});

export const listGuardianshipsAnimalSchema = z
	.object({
		id: z.uuid(),
		name: z.string(),
		avatarUrl: z.string().nullable(),
		species: z.enum(AnimalSpeciesEnum),
		curatorId: z.string().nullable(),
		costOfGuardianship: z.number().nullable()
	})
	.loose();

export const listGuardianshipsGuardianSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		email: z.string().nullable(),
		telegram: z.string().nullable(),
		telegramChatId: z.string().nullable(),
		telegramUnreachable: z.boolean()
	})
	.loose();

export const listGuardianshipsItemSchema = z
	.object({
		id: z.uuid(),
		animalId: z.uuid(),
		status: z.enum(GuardianshipStatusEnum),
		subscriptionId: z.string(),
		startedAt: z.string().describe('ISO дата создания опекунства'),
		paidPeriodEndAt: z.string().nullable().describe('ISO дата конца оплаченного периода'),
		cancelledAt: z.string().nullable().describe('ISO дата отмены'),
		guardianPrivilegesUntil: z
			.string()
			.nullable()
			.describe('ISO дата, до которой у опекуна остаётся портальный доступ после отмены'),
		animal: listGuardianshipsAnimalSchema,
		guardian: listGuardianshipsGuardianSchema
	})
	.loose();

export const listGuardianshipsResponseSchema = createApiPaginatedResponseSchema(listGuardianshipsItemSchema);

export type ListGuardianshipsRequest = z.input<typeof listGuardianshipsRequestSchema>;
export type ListGuardianshipsResult = z.infer<typeof listGuardianshipsResponseSchema>;
export type ListGuardianshipsItem = z.infer<typeof listGuardianshipsItemSchema>;
