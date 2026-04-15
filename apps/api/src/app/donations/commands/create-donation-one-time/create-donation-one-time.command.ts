import { Command } from '@nestjs/cqrs';
import { CreateOneTimeDonationRequestDto } from '../../../core/dto';

export class CreateDonationOneTimeCommand extends Command<{ paymentUrl: string; transactionId: string }> {
	constructor(public readonly dto: CreateOneTimeDonationRequestDto) {
		super();
	}
}
