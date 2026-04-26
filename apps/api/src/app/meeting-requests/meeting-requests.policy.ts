import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@pif/shared';
import { UsersService } from '../users/users.service';
import { ForbiddenMeetingRequestAccessException } from './exceptions/forbidden-meeting-request-access.exception';

@Injectable()
export class MeetingRequestsPolicy {
	constructor(private readonly usersService: UsersService) {}

	async assertCanManageByCurator(curatorUserId: string, requesterUserId: string): Promise<void> {
		const volunteer = await this.usersService.findById(curatorUserId);
		if (!volunteer) {
			throw new NotFoundException('Не найден волонтёр');
		}
		if (volunteer.role == UserRole.ADMIN || volunteer.role == UserRole.SENIOR_VOLUNTEER) {
			return;
		}
		if (volunteer.id !== requesterUserId) {
			throw new ForbiddenMeetingRequestAccessException();
		}
	}
}
