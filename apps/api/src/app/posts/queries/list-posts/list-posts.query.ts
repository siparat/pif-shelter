import { Query } from '@nestjs/cqrs';
import { ListPostsResult } from '@pif/contracts';
import { UserRole } from '@pif/shared';
import { ListPostsRequestDto } from '../../../core/dto';

export class ListPostsQuery extends Query<ListPostsResult> {
	constructor(
		public readonly dto: ListPostsRequestDto,
		public readonly userId: string | null,
		public readonly userRole: UserRole | null,
		public readonly visitorId?: string
	) {
		super();
	}
}
