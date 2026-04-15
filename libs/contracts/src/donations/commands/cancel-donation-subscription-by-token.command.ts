import { z } from 'zod';
import { createApiSuccessResponseSchema } from '../../common';

export const cancelDonationSubscriptionByTokenRequestSchema = z.object({
	token: z.uuid().describe('Токен отмены из ссылки в письме')
});

export const cancelDonationSubscriptionByTokenResponseSchema = createApiSuccessResponseSchema(
	z.object({
		subscriptionId: z.string().min(1).describe('Внешний id подписки, для которой выполнена отмена')
	})
);
