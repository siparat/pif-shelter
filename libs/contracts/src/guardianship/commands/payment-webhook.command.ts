import { PaymentWebhookEvent } from '@pif/payment';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const subscriptionEvents = new Set<PaymentWebhookEvent>([
	PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED,
	PaymentWebhookEvent.SUBSCRIPTION_FAILED,
	PaymentWebhookEvent.SUBSCRIPTION_CANCELED
]);

const paymentEvents = new Set<PaymentWebhookEvent>([
	PaymentWebhookEvent.PAYMENT_SUCCEEDED,
	PaymentWebhookEvent.PAYMENT_FAILED
]);

const successLedgerEvents = new Set<PaymentWebhookEvent>([
	PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED,
	PaymentWebhookEvent.PAYMENT_SUCCEEDED
]);

export const paymentWebhookRequestSchema = z
	.object({
		subscriptionId: z.string().min(1).optional(),
		transactionId: z.string().min(1).optional(),
		event: z.enum(PaymentWebhookEvent),
		providerPaymentId: z.string().min(1).optional(),
		grossAmount: z.number().int().nonnegative().optional(),
		feeAmount: z.number().int().nonnegative().optional(),
		netAmount: z.number().int().nonnegative().optional(),
		paidAt: z.iso.datetime().optional()
	})
	.superRefine((data, ctx) => {
		const hasSub = !!data.subscriptionId?.length;
		const hasTxn = !!data.transactionId?.length;

		if (subscriptionEvents.has(data.event)) {
			if (!hasSub) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для события подписки укажите subscriptionId',
					path: ['subscriptionId']
				});
			}
			if (hasTxn) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для события подписки не передавайте transactionId',
					path: ['transactionId']
				});
			}
		}

		if (paymentEvents.has(data.event)) {
			if (!hasTxn) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для события разового платежа укажите transactionId',
					path: ['transactionId']
				});
			}
			if (hasSub) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для события разового платежа не передавайте subscriptionId',
					path: ['subscriptionId']
				});
			}
		}

		if (successLedgerEvents.has(data.event)) {
			if (!data.providerPaymentId) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для успешной оплаты укажите providerPaymentId',
					path: ['providerPaymentId']
				});
			}
			if (data.grossAmount === undefined) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для успешной оплаты укажите grossAmount',
					path: ['grossAmount']
				});
			}
			if (data.feeAmount === undefined) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для успешной оплаты укажите feeAmount',
					path: ['feeAmount']
				});
			}
			if (data.netAmount === undefined) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для успешной оплаты укажите netAmount',
					path: ['netAmount']
				});
			}
			if (!data.paidAt) {
				ctx.addIssue({
					code: 'custom',
					message: 'Для успешной оплаты укажите paidAt',
					path: ['paidAt']
				});
			}
			if (
				data.grossAmount !== undefined &&
				data.feeAmount !== undefined &&
				data.netAmount !== undefined &&
				data.grossAmount !== data.feeAmount + data.netAmount
			) {
				ctx.addIssue({
					code: 'custom',
					message: 'grossAmount должна равняться feeAmount + netAmount',
					path: ['grossAmount']
				});
			}
		}
	});

export type PaymentWebhookPayload = z.infer<typeof paymentWebhookRequestSchema>;

export class PaymentWebhookRequestDto extends createZodDto(paymentWebhookRequestSchema) {}

const paymentWebhookHandledBySchema = z.enum(['guardianship', 'donation_one_time', 'donation_subscription']);

export const paymentWebhookResponseSchema = z.object({
	guardianshipId: z.uuid().optional(),
	activated: z.boolean().optional(),
	cancelled: z.boolean().optional(),
	donationOneTimeIntentId: z.uuid().optional(),
	donationSubscriptionId: z.uuid().optional(),
	ledgerEntryId: z.uuid().optional(),
	handledBy: paymentWebhookHandledBySchema.optional()
});

export type PaymentWebhookResponse = z.infer<typeof paymentWebhookResponseSchema>;
