import { ListCuratorMeetingRequestsQueryDto } from '../../../core/dto';

export class ListCuratorMeetingRequestsQuery {
	constructor(
		public readonly dto: ListCuratorMeetingRequestsQueryDto,
		public readonly curatorUserId: string
	) {}
}
