import { Command } from '@nestjs/cqrs';

export class CancelGuardianshipByTokenCommand extends Command<{ guardianshipId: string }> {
	constructor(public readonly token: string) {
		super();
	}
}
