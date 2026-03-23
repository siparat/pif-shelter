import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import { donationAmountKopecksSchema } from './donation-amount.schema';

export const createOneTimeDonationRequestSchema = z.object({
	displayName: z.string().describe('Имя для публичного отчёта; при анонимности UI передаёт пустую строку'),
	hidePublicName: z.boolean().describe('Не отдавать имя в публичном отчёте'),
	amount: donationAmountKopecksSchema.describe('Сумма разового доната в копейках')
});

export class CreateOneTimeDonationRequestDto extends createZodDto(createOneTimeDonationRequestSchema) {}

export const createOneTimeDonationResponseSchema = z.object({
	paymentUrl: z.url().describe('URL мок-оплаты'),
	transactionId: z.string().min(1).describe('Идентификатор намерения для transaction-id в URL')
});

export class CreateOneTimeDonationResponseDto extends createZodDto(createOneTimeDonationResponseSchema) {}
