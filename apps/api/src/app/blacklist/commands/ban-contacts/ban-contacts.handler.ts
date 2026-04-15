import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BlacklistContext } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { BanContactsResponseDto, ReturnData } from '../../../core/dto';
import { BlacklistService } from '../../blacklist.service';
import { ContactsBannedEvent } from '../../events/contacts-banned/contacts-banned.event';
import { BanContactsCommand } from './ban-contacts.command';

@CommandHandler(BanContactsCommand)
export class BanContactsHandler implements ICommandHandler<BanContactsCommand> {
	constructor(
		private readonly blacklistService: BlacklistService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto, moderatorId }: BanContactsCommand): Promise<ReturnData<typeof BanContactsResponseDto>> {
		const result = await this.blacklistService.banSource(
			moderatorId,
			dto.reason,
			BlacklistContext.MANUAL,
			...dto.sources
		);

		this.eventBus.publish(new ContactsBannedEvent(dto, moderatorId));

		this.logger.log(`${result.updated} контактов внесено в черный список`, {
			moderatorId,
			reason: dto.reason,
			contacts: dto.sources.map((s) => s.value)
		});

		return result;
	}
}
