import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common';

export const cancelDonationSubscriptionRequestSchema = z.object({
	subscriptionId: z
		.string()
		.min(1)
		.describe('Тот же subscription_id, что в мок-PSP и donation_subscriptions.subscription_id'),
	email: z.email().describe('Email для отправки ссылки отмены подписки')
});

export const cancelDonationSubscriptionResponseSchema = createApiSuccessResponseSchema(
	z.object({
		subscriptionId: z.string().min(1).describe('Внешний id подписки, для которой отправлена ссылка отмены')
	})
);
