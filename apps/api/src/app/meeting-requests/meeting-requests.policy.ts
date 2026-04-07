import { Injectable } from '@nestjs/common';
import { ForbiddenMeetingRequestAccessException } from './exceptions/forbidden-meeting-request-access.exception';

@Injectable()
export class MeetingRequestsPolicy {
	assertCanManageByCurator(curatorUserId: string, requesterUserId: string): void {
		if (curatorUserId !== requesterUserId) {
			throw new ForbiddenMeetingRequestAccessException();
		}
	}
}
