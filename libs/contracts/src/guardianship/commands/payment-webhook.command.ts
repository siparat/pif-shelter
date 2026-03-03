import { PaymentWebhookEvent } from '@pif/payment';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const paymentWebhookRequestSchema = z.object({
	subscriptionId: z.string().min(1).describe('Идентификатор подписки (transaction-id от платёжного провайдера)'),
	event: z
		.enum(PaymentWebhookEvent)
		.describe('Тип события: payment.succeeded — первый платёж прошёл, опекунство активируется')
});

export class PaymentWebhookRequestDto extends createZodDto(paymentWebhookRequestSchema) {}

export const paymentWebhookResponseSchema = z.object({
	guardianshipId: z.uuid(),
	activated: z.boolean().describe('true — статус изменён на ACTIVE в этом запросе, false — уже был активен')
});

export type PaymentWebhookResponse = z.infer<typeof paymentWebhookResponseSchema>;
