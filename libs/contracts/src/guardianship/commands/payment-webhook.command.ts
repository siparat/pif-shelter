import { PaymentWebhookEvent } from '@pif/payment';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const paymentWebhookRequestSchema = z.object({
	subscriptionId: z.string().min(1).describe('Идентификатор подписки (transaction-id от платёжного провайдера)'),
	event: z
		.enum(PaymentWebhookEvent)
		.describe(
			'subscription.succeeded — оплата прошла, опекунство активируется; subscription.failed — первый платёж не прошёл, PENDING_PAYMENT → CANCELLED; subscription.canceled — отмена подписки вручную в сервисе'
		)
});

export class PaymentWebhookRequestDto extends createZodDto(paymentWebhookRequestSchema) {}

export const paymentWebhookResponseSchema = z.object({
	guardianshipId: z.uuid(),
	activated: z.boolean().optional().describe('true — статус изменён на ACTIVE в этом запросе'),
	cancelled: z.boolean().optional().describe('true — опекунство отменено в этом запросе (failed или canceled)')
});

export type PaymentWebhookResponse = z.infer<typeof paymentWebhookResponseSchema>;
