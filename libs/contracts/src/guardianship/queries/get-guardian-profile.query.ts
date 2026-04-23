import { UserRole } from '@pif/shared';
import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common/base.responses';
import { listGuardianshipsItemSchema } from './list-guardianships.query';

export const getGuardianProfileRequestSchema = z.object({
	userId: z.string().min(1).describe('ID пользователя-опекуна')
});

export const guardianProfileUserSchema = z
	.object({
		id: z.string(),
		name: z.string(),
		email: z.string().nullable(),
		image: z.string().nullable(),
		role: z.enum(UserRole),
		telegram: z.string().nullable(),
		telegramChatId: z.string().nullable(),
		telegramUnreachable: z.boolean(),
		banned: z.boolean().describe('Доступ в систему заблокирован'),
		telegramChatIdUpdatedAt: z.string().nullable(),
		createdAt: z.string(),
		updatedAt: z.string().nullable()
	})
	.loose();

export const guardianProfileStatsSchema = z
	.object({
		activeCount: z.number().int().nonnegative(),
		pendingPaymentCount: z.number().int().nonnegative(),
		cancelledCount: z.number().int().nonnegative(),
		totalCount: z.number().int().nonnegative(),
		monthlyContribution: z.number().nonnegative().describe('Сумма активных опекунств в месяц, ₽'),
		firstGuardianshipAt: z.string().nullable(),
		lastActivityAt: z.string().nullable()
	})
	.loose();

export const getGuardianProfileResponseSchema = createApiSuccessResponseSchema(
	z.object({
		user: guardianProfileUserSchema,
		stats: guardianProfileStatsSchema,
		guardianships: z.array(listGuardianshipsItemSchema)
	})
);

export type GetGuardianProfileRequest = z.input<typeof getGuardianProfileRequestSchema>;
export type GetGuardianProfileResult = z.infer<typeof getGuardianProfileResponseSchema>;
export type GuardianProfileUser = z.infer<typeof guardianProfileUserSchema>;
export type GuardianProfileStats = z.infer<typeof guardianProfileStatsSchema>;
