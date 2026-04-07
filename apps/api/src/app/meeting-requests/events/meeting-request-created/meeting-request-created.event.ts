import { meetingRequests } from '@pif/database';

export class MeetingRequestCreatedEvent {
	constructor(public readonly meetingRequest: typeof meetingRequests.$inferSelect) {}
}
