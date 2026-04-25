import { Command } from '@nestjs/cqrs';
import { UserRole } from '@pif/shared';

export class SetUserRoleCommand extends Command<{ userId: string; roleName: UserRole }> {
	constructor(
		public readonly userId: string,
		public readonly roleName: UserRole,
		public readonly actorUserId: string
	) {
		super();
	}
}
