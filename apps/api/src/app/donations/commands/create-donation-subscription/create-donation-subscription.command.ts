import { Command } from '@nestjs/cqrs';
import { CreateDonationSubscriptionRequestDto } from '@pif/contracts';

export class CreateDonationSubscriptionCommand extends Command<{ paymentUrl: string; subscriptionId: string }> {
	constructor(public readonly dto: CreateDonationSubscriptionRequestDto) {
		super();
	}
}
