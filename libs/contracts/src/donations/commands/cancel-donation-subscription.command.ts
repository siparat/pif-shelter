import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const cancelDonationSubscriptionRequestSchema = z.object({
	subscriptionId: z
		.string()
		.min(1)
		.describe('Тот же subscription_id, что в мок-PSP и donation_subscriptions.subscription_id')
});

export class CancelDonationSubscriptionRequestDto extends createZodDto(cancelDonationSubscriptionRequestSchema) {}

export const cancelDonationSubscriptionResponseSchema = z.object({
	cancelled: z.boolean().describe('Подписка помечена отменённой в этой операции')
});

export class CancelDonationSubscriptionResponseDto extends createZodDto(cancelDonationSubscriptionResponseSchema) {}
