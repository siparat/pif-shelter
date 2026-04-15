import { Command } from '@nestjs/cqrs';
import { CreateDonationSubscriptionRequestDto } from '../../../core/dto';

export class CreateDonationSubscriptionCommand extends Command<{ paymentUrl: string; subscriptionId: string }> {
	constructor(public readonly dto: CreateDonationSubscriptionRequestDto) {
		super();
	}
}
