import { Injectable } from '@nestjs/common';
import { BanContactsResponseDto, ReturnDto } from '@pif/contracts';
import { BlacklistRepository, IBlacklistSource } from './repositories/blacklist.repository';

@Injectable()
export class BlacklistService {
	constructor(private readonly repository: BlacklistRepository) {}

	async banSource(
		moderatorId: string,
		reason: string,
		...sources: IBlacklistSource[]
	): Promise<ReturnDto<typeof BanContactsResponseDto>> {
		const updatedCount = await this.repository.banContacts(moderatorId, reason, ...sources);
		return { updated: updatedCount };
	}
}
