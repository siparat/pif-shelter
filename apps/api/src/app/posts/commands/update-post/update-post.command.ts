import { UpdatePostRequestDto } from '@pif/contracts';
import { UserRole } from '@pif/shared';

export class UpdatePostCommand {
	constructor(
		public readonly postId: string,
		public readonly dto: UpdatePostRequestDto,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {}
}
