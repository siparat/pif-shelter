import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmMeetingRequestResponseDto, ReturnDto } from '@pif/contracts';
import { MeetingRequestStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { MeetingRequestConfirmedEvent } from '../../events/meeting-request-confirmed/meeting-request-confirmed.event';
import { MeetingRequestInvalidStatusException } from '../../exceptions/meeting-request-invalid-status.exception';
import { MeetingRequestNotFoundException } from '../../exceptions/meeting-request-not-found.exception';
import { MeetingRequestsPolicy } from '../../meeting-requests.policy';
import { MeetingRequestsRepository } from '../../repositories/meeting-requests.repository';
import { ConfirmMeetingRequestCommand } from './confirm-meeting-request.command';

@CommandHandler(ConfirmMeetingRequestCommand)
export class ConfirmMeetingRequestHandler implements ICommandHandler<ConfirmMeetingRequestCommand> {
	constructor(
		private readonly repository: MeetingRequestsRepository,
		private readonly policy: MeetingRequestsPolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		id,
		curatorUserId
	}: ConfirmMeetingRequestCommand): Promise<ReturnDto<typeof ConfirmMeetingRequestResponseDto>> {
		const existing = await this.repository.findById(id);
		if (!existing) {
			throw new MeetingRequestNotFoundException();
		}
		this.policy.assertCanManageByCurator(existing.curatorUserId, curatorUserId);
		if (existing.status !== MeetingRequestStatusEnum.NEW) {
			throw new MeetingRequestInvalidStatusException();
		}
		const confirmed = await this.repository.confirm(id, new Date());
		if (!confirmed) {
			throw new MeetingRequestInvalidStatusException();
		}
		await this.eventBus.publish(new MeetingRequestConfirmedEvent(confirmed));
		this.logger.log('Заявка на встречу подтверждена', { meetingRequestId: id, curatorUserId });
		return { id, status: MeetingRequestStatusEnum.CONFIRMED };
	}
}
