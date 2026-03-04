import { Command } from '@nestjs/cqrs';

export class CancelGuardianshipCommand extends Command<{ guardianshipId: string }> {
	constructor(
		public readonly guardianshipId: string,
		public readonly reason: string
	) {
		super();
	}
}
