import { NotFoundException } from '@nestjs/common';

export class DonationSubscriptionNotFoundException extends NotFoundException {
	constructor(subscriptionId: string) {
		super(`Донат-подписка с subscriptionId ${subscriptionId} не найдена`);
	}
}
