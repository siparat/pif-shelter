import { Injectable } from '@nestjs/common';
import { BanContactsResponseDto, DeleteContactFromBlacklistResponseDto, ReturnDto } from '@pif/contracts';
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

	async delete(id: string): Promise<ReturnDto<typeof DeleteContactFromBlacklistResponseDto>> {
		const count = await this.repository.delete(id);

		return { ok: count > 0 };
	}
}
