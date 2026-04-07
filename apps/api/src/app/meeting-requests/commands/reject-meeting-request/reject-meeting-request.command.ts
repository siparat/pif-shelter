export class RejectMeetingRequestCommand {
	constructor(
		public readonly id: string,
		public readonly curatorUserId: string,
		public readonly reason: string
	) {}
}
