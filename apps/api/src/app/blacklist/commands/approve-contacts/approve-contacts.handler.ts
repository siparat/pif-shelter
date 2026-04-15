import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BlacklistContext } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { ApproveContactsResponseDto, ReturnData } from '../../../core/dto';
import { BlacklistService } from '../../blacklist.service';
import { ContactsApprovedEvent } from '../../events/contacts-approved/contacts-approved.event';
import { ApproveContactsCommand } from './approve-contacts.command';

@CommandHandler(ApproveContactsCommand)
export class ApproveContactsHandler implements ICommandHandler<ApproveContactsCommand> {
	constructor(
		private readonly blacklistService: BlacklistService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		dto,
		moderatorId
	}: ApproveContactsCommand): Promise<ReturnData<typeof ApproveContactsResponseDto>> {
		const result = await this.blacklistService.approveSource(moderatorId, BlacklistContext.MANUAL, ...dto.sources);

		if (result.updated > 0) {
			this.eventBus.publish(new ContactsApprovedEvent(dto, moderatorId));
		}

		this.logger.log(`${result.updated} контактов разблокировано`, {
			moderatorId,
			contacts: dto.sources.map((s) => s.value)
		});

		return result;
	}
}
