import { BadRequestException, Injectable } from '@nestjs/common';
import {
	ApproveContactsResponseDto,
	BanContactsResponseDto,
	DeleteContactFromBlacklistResponseDto,
	ReturnDto,
	SuspectContactsResponseDto
} from '@pif/contracts';
import { BlacklistContext } from '@pif/shared';
import dayjs from 'dayjs';
import { BlacklistRepository, IBlacklistSource } from './repositories/blacklist.repository';

@Injectable()
export class BlacklistService {
	constructor(private readonly repository: BlacklistRepository) {}

	async banSource(
		moderatorId: string,
		reason: string,
		context: BlacklistContext,
		...sources: IBlacklistSource[]
	): Promise<ReturnDto<typeof BanContactsResponseDto>> {
		const updatedCount = await this.repository.banContacts(moderatorId, reason, context, ...sources);
		return { updated: updatedCount };
	}

	async approveSource(
		moderatorId: string,
		context: BlacklistContext,
		...sources: IBlacklistSource[]
	): Promise<ReturnDto<typeof ApproveContactsResponseDto>> {
		const updatedCount = await this.repository.approveContacts(moderatorId, context, ...sources);
		return { updated: updatedCount };
	}

	async suspectSource(
		moderatorId: string,
		reason: string,
		context: BlacklistContext,
		endsAt: Date,
		...sources: IBlacklistSource[]
	): Promise<ReturnDto<typeof SuspectContactsResponseDto>> {
		if (dayjs().isBefore(endsAt)) {
			throw new BadRequestException('Дата истечения не может быть в прошлом');
		}
		const updatedCount = await this.repository.suspectContacts(moderatorId, reason, context, endsAt, ...sources);
		return { updated: updatedCount };
	}

	async markSuspicionAsExpired(): Promise<{ count: number }> {
		const count = await this.repository.markSuspicionAsExpired(new Date());
		return { count };
	}

	async delete(id: string): Promise<ReturnDto<typeof DeleteContactFromBlacklistResponseDto>> {
		const count = await this.repository.delete(id);

		return { ok: count > 0 };
	}
}
