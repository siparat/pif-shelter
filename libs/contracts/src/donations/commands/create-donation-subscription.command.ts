import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common';
import { donationAmountKopecksSchema } from '../donation-amount.schema';

export const createDonationSubscriptionRequestSchema = z.object({
	displayName: z.string().describe('Имя для публичного отчёта; при анонимности UI передаёт пустую строку'),
	hidePublicName: z.boolean().describe('Не отдавать имя в публичном отчёте'),
	email: z.email().describe('Email для отправки ссылки отмены донат-подписки'),
	amountPerMonth: donationAmountKopecksSchema.describe('Ежемесячная сумма в копейках')
});

export const createDonationSubscriptionResponseSchema = createApiSuccessResponseSchema(
	z.object({
		paymentUrl: z.url().describe('URL мок-оплаты первого платежа'),
		subscriptionId: z.string().min(1).describe('Внешний id подписки для вебхука и мок-PSP')
	})
);
