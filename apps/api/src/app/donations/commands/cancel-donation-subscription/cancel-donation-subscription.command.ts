import { Command } from '@nestjs/cqrs';
import { CancelDonationSubscriptionRequestDto } from '@pif/contracts';

export class CancelDonationSubscriptionCommand extends Command<{ cancelled: boolean }> {
	constructor(public readonly dto: CancelDonationSubscriptionRequestDto) {
		super();
	}
}
