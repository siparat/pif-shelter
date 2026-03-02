import { Command } from '@nestjs/cqrs';
import { StartGuardianshipRequestDto } from '@pif/contracts';

export class StartGuardianshipCommand extends Command<{ guardianshipId: string; paymentUrl: string }> {
	constructor(
		public readonly userId: string,
		public readonly dto: StartGuardianshipRequestDto
	) {
		super();
	}
}
