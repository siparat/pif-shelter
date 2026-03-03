import { Command } from '@nestjs/cqrs';

export class StartGuardianshipCommand extends Command<{ guardianshipId: string; paymentUrl: string }> {
	constructor(
		public readonly userId: string,
		public readonly animalId: string
	) {
		super();
	}
}
