import { meetingRequests } from '@pif/database';

export class MeetingRequestRejectedEvent {
	constructor(public readonly meetingRequest: typeof meetingRequests.$inferSelect) {}
}
