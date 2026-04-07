import { ListCuratorMeetingRequestsQueryDto } from '@pif/contracts';

export class ListCuratorMeetingRequestsQuery {
	constructor(
		public readonly dto: ListCuratorMeetingRequestsQueryDto,
		public readonly curatorUserId: string
	) {}
}
