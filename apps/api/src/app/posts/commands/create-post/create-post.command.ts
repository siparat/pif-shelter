import { UserRole } from '@pif/shared';
import { CreatePostRequestDto } from '../../../core/dto';

export class CreatePostCommand {
	constructor(
		public readonly dto: CreatePostRequestDto,
		public readonly authorId: string,
		public readonly authorRole: UserRole
	) {}
}
