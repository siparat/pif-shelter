import { UserRole } from '@pif/shared';

export class DeletePostCommand {
	constructor(
		public readonly postId: string,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {}
}
