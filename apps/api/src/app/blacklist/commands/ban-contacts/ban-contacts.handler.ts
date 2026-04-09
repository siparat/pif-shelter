import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanContactsResponseDto, ReturnDto } from '@pif/contracts';
import { BlacklistService } from '../../blacklist.service';
import { BanContactsCommand } from './ban-contacts.command';

@CommandHandler(BanContactsCommand)
export class BanContactsHandler implements ICommandHandler<BanContactsCommand> {
	constructor(private readonly blacklistService: BlacklistService) {}

	async execute({ dto, moderatorId }: BanContactsCommand): Promise<ReturnDto<typeof BanContactsResponseDto>> {
		return this.blacklistService.banSource(moderatorId, dto.reason, ...dto.sources);
	}
}
