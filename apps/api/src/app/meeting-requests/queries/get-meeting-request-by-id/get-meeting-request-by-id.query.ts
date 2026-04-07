export class GetMeetingRequestByIdQuery {
	constructor(
		public readonly id: string,
		public readonly requesterUserId: string
	) {}
}
