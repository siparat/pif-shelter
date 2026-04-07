import { meetingRequests } from '@pif/database';

export class MeetingRequestConfirmedEvent {
	constructor(public readonly meetingRequest: typeof meetingRequests.$inferSelect) {}
}
