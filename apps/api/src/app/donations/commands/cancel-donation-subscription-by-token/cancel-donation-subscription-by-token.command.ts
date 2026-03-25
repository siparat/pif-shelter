import { Command } from '@nestjs/cqrs';

export class CancelDonationSubscriptionByTokenCommand extends Command<{ subscriptionId: string }> {
	constructor(public readonly token: string) {
		super();
	}
}
