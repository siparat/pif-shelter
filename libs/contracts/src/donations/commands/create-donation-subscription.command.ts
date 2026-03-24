import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { donationAmountKopecksSchema } from '../donation-amount.schema';

export const createDonationSubscriptionRequestSchema = z.object({
	displayName: z.string().describe('Имя для публичного отчёта; при анонимности UI передаёт пустую строку'),
	hidePublicName: z.boolean().describe('Не отдавать имя в публичном отчёте'),
	amountPerMonth: donationAmountKopecksSchema.describe('Ежемесячная сумма в копейках')
});

export class CreateDonationSubscriptionRequestDto extends createZodDto(createDonationSubscriptionRequestSchema) {}

export const createDonationSubscriptionResponseSchema = z.object({
	paymentUrl: z.url().describe('URL мок-оплаты первого платежа'),
	subscriptionId: z.string().min(1).describe('Внешний id подписки для вебхука и мок-PSP')
});

export class CreateDonationSubscriptionResponseDto extends createZodDto(createDonationSubscriptionResponseSchema) {}
