import { CreatePostRequestDto } from '@pif/contracts';
import { UserRole } from '@pif/shared';

export class CreatePostCommand {
	constructor(
		public readonly dto: CreatePostRequestDto,
		public readonly authorId: string,
		public readonly authorRole: UserRole
	) {}
}
