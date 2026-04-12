import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { DeleteContactFromBlacklistResponseDto, ReturnDto } from '@pif/contracts';
import { Logger } from 'nestjs-pino';
import { BlacklistService } from '../../blacklist.service';
import { ContactDeletedFromBlacklistEvent } from '../../events/contact-deleted-from-blacklist/contact-deleted-from-blacklist.event';
import { DeleteContactFromBlacklistCommand } from './delete-contact-from-blacklist.command';

@CommandHandler(DeleteContactFromBlacklistCommand)
export class DeleteContactFromBlacklistHandler implements ICommandHandler<DeleteContactFromBlacklistCommand> {
	constructor(
		private readonly blacklistService: BlacklistService,
		private readonly logger: Logger,
		private readonly eventBus: EventBus
	) {}

	async execute({
		id,
		moderatorId
	}: DeleteContactFromBlacklistCommand): Promise<ReturnDto<typeof DeleteContactFromBlacklistResponseDto>> {
		const result = await this.blacklistService.delete(id);

		if (result.ok) {
			this.eventBus.publish(new ContactDeletedFromBlacklistEvent(id));
			this.logger.log('Удалена запись из черного списка', { id, moderatorId });
		}

		return result;
	}
}
