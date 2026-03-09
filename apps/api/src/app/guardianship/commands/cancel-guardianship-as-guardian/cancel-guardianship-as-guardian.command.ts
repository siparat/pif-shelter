import { Command } from '@nestjs/cqrs';

export class CancelGuardianshipAsGuardianCommand extends Command<{ guardianshipId: string }> {
	constructor(
		public readonly guardianshipId: string,
		public readonly guardianUserId: string
	) {
		super();
	}
}
