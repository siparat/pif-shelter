export class ConfirmMeetingRequestCommand {
	constructor(
		public readonly id: string,
		public readonly curatorUserId: string
	) {}
}
