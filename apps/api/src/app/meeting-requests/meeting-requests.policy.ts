import { Injectable, NotFoundException } from '@nestjs/common';
import { ForbiddenMeetingRequestAccessException } from './exceptions/forbidden-meeting-request-access.exception';
import { UsersRepository } from '../users/repositories/users.repository';
import { UserRole } from '@pif/shared';

@Injectable()
export class MeetingRequestsPolicy {
	constructor(private readonly repository: UsersRepository) {}

	async assertCanManageByCurator(curatorUserId: string, requesterUserId: string): Promise<void> {
		const volunteer = await this.repository.findById(curatorUserId);
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
