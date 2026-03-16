import { Query } from '@nestjs/cqrs';
import { ListPostsRequestDto, ListPostsResult } from '@pif/contracts';
import { UserRole } from '@pif/shared';

export class ListPostsQuery extends Query<ListPostsResult> {
	constructor(
		public readonly dto: ListPostsRequestDto,
		public readonly userId: string | null,
		public readonly userRole: UserRole | null
	) {
		super();
	}
}
