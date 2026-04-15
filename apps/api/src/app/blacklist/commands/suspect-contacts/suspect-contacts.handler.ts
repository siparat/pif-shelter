import { BadRequestException } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BlacklistContext } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { ReturnData, SuspectContactsResponseDto } from '../../../core/dto';
import { BlacklistService } from '../../blacklist.service';
import { ContactsSuspectedEvent } from '../../events/contacts-suspected/contacts-suspected.event';
import { SuspectContactsCommand } from './suspect-contacts.command';

@CommandHandler(SuspectContactsCommand)
export class SuspectContactsHandler implements ICommandHandler<SuspectContactsCommand> {
	constructor(
		private readonly blacklistService: BlacklistService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({
		dto,
		moderatorId
	}: SuspectContactsCommand): Promise<ReturnData<typeof SuspectContactsResponseDto>> {
		const endsAt = new Date(dto.suspicionEndsAt);
		if (Number.isNaN(endsAt.getTime())) {
			throw new BadRequestException('Невалидный срок конца подозрения');
		}
		const result = await this.blacklistService.suspectSource(
			moderatorId,
			dto.reason,
			BlacklistContext.MANUAL,
			endsAt,
			...dto.sources
		);
		this.eventBus.publish(new ContactsSuspectedEvent(dto, moderatorId));
		this.logger.log(`${result.updated} контактов внесено в подозрение`, {
			moderatorId,
			reason: dto.reason,
			contacts: dto.sources.map((source) => source.value)
		});
		return result;
	}
}
