import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateMeetingRequestResponseDto, ReturnDto } from '@pif/contracts';
import { Logger } from 'nestjs-pino';
import { MeetingRequestAnimalNotFoundException } from '../../exceptions/meeting-request-animal-not-found.exception';
import { MeetingRequestCuratorNotAssignedException } from '../../exceptions/meeting-request-curator-not-assigned.exception';
import { MeetingRequestCreatedEvent } from '../../events/meeting-request-created/meeting-request-created.event';
import { MeetingRequestsRepository } from '../../repositories/meeting-requests.repository';
import { CreateMeetingRequestCommand } from './create-meeting-request.command';

@CommandHandler(CreateMeetingRequestCommand)
export class CreateMeetingRequestHandler implements ICommandHandler<CreateMeetingRequestCommand> {
	constructor(
		private readonly repository: MeetingRequestsRepository,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto }: CreateMeetingRequestCommand): Promise<ReturnDto<typeof CreateMeetingRequestResponseDto>> {
		const animal = await this.repository.findAnimalWithCurator(dto.animalId);
		if (!animal) {
			throw new MeetingRequestAnimalNotFoundException();
		}
		if (!animal.curatorId) {
			throw new MeetingRequestCuratorNotAssignedException();
		}

		const created = await this.repository.create({
			animalId: dto.animalId,
			curatorUserId: animal.curatorId,
			name: dto.name,
			phone: dto.phone,
			email: dto.email ?? null,
			comment: dto.comment ?? null,
			meetingAt: new Date(dto.meetingAt)
		});

		await this.eventBus.publish(new MeetingRequestCreatedEvent(created));
		this.logger.log('Создана заявка на встречу', { meetingRequestId: created.id, animalId: dto.animalId });
		return { id: created.id };
	}
}
