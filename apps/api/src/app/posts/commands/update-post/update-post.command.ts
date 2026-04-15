import { UserRole } from '@pif/shared';
import { UpdatePostRequestDto } from '../../../core/dto';

export class UpdatePostCommand {
	constructor(
		public readonly postId: string,
		public readonly dto: UpdatePostRequestDto,
		public readonly userId: string,
		public readonly userRole: UserRole
	) {}
}
