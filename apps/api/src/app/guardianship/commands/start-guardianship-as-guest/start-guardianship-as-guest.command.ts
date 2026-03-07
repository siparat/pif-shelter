import { Command } from '@nestjs/cqrs';
import { StartGuardianshipRequestDto } from '@pif/contracts';

export class StartGuardianshipAsGuestCommand extends Command<{ guardianshipId: string; paymentUrl: string }> {
	constructor(public readonly dto: StartGuardianshipRequestDto) {
		super();
	}
}
