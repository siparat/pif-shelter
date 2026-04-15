import { Command } from '@nestjs/cqrs';
import { StartGuardianshipRequestDto } from '../../../core/dto';

export class StartGuardianshipAsGuestCommand extends Command<{
	guardianshipId: string;
	paymentUrl: string;
	cancellationToken: string;
}> {
	constructor(public readonly dto: StartGuardianshipRequestDto) {
		super();
	}
}
