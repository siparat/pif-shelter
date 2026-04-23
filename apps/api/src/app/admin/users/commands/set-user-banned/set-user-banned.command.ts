import { Command } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';

export class SetUserBannedCommand extends Command<{ userId: string; banned: boolean }> {
	constructor(
		public readonly userId: string,
		public readonly banned: boolean,
		public readonly actorUserId: string,
		public readonly actorRole: UserRole
	) {
		super();
	}
}
