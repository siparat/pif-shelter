import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { MeetingRequestStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { RejectMeetingRequestResponseDto, ReturnData } from '../../../core/dto';
import { MeetingRequestRejectedEvent } from '../../events/meeting-request-rejected/meeting-request-rejected.event';
import { MeetingRequestInvalidStatusException } from '../../exceptions/meeting-request-invalid-status.exception';
import { MeetingRequestNotFoundException } from '../../exceptions/meeting-request-not-found.exception';
import { MeetingRequestsPolicy } from '../../meeting-requests.policy';
import { MeetingRequestsRepository } from '../../repositories/meeting-requests.repository';
import { RejectMeetingRequestCommand } from './reject-meeting-request.command';

@CommandHandler(RejectMeetingRequestCommand)
export class RejectMeetingRequestHandler implements ICommandHandler<RejectMeetingRequestCommand> {
	constructor(
		private readonly repository: MeetingRequestsRepository,
		private readonly policy: MeetingRequestsPolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		id,
		curatorUserId,
		reason
	}: RejectMeetingRequestCommand): Promise<ReturnData<typeof RejectMeetingRequestResponseDto>> {
		const existing = await this.repository.findById(id);
		if (!existing) {
			throw new MeetingRequestNotFoundException();
		}
		this.policy.assertCanManageByCurator(existing.curatorUserId, curatorUserId);
		if (existing.status !== MeetingRequestStatusEnum.NEW) {
			throw new MeetingRequestInvalidStatusException();
		}
		const rejected = await this.repository.reject(id, new Date(), reason);
		if (!rejected) {
			throw new MeetingRequestInvalidStatusException();
		}
		await this.eventBus.publish(new MeetingRequestRejectedEvent(rejected));
		this.logger.log('Заявка на встречу отклонена', { meetingRequestId: id, curatorUserId });
		return { id, status: MeetingRequestStatusEnum.REJECTED };
	}
}
