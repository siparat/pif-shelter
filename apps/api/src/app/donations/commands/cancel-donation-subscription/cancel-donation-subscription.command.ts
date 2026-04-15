import { Command } from '@nestjs/cqrs';
import { CancelDonationSubscriptionRequestDto } from '../../../core/dto';

export class CancelDonationSubscriptionCommand extends Command<{ cancelled: boolean }> {
	constructor(public readonly dto: CancelDonationSubscriptionRequestDto) {
		super();
	}
}
