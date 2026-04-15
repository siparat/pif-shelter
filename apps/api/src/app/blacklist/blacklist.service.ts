import { BadRequestException, Injectable } from '@nestjs/common';
import { BlacklistContext } from '@pif/shared';
import dayjs from 'dayjs';
import {
	ApproveContactsResponseDto,
	BanContactsResponseDto,
	DeleteContactFromBlacklistResponseDto,
	ReturnData,
	SuspectContactsResponseDto
} from '../core/dto';
import { BlacklistRepository, IBlacklistSource } from './repositories/blacklist.repository';

@Injectable()
export class BlacklistService {
	constructor(private readonly repository: BlacklistRepository) {}

	async banSource(
		moderatorId: string,
		reason: string,
		context: BlacklistContext,
		...sources: IBlacklistSource[]
	): Promise<ReturnData<typeof BanContactsResponseDto>> {
		const updatedCount = await this.repository.banContacts(moderatorId, reason, context, ...sources);
		return { updated: updatedCount };
	}

	async approveSource(
		moderatorId: string,
		context: BlacklistContext,
		...sources: IBlacklistSource[]
	): Promise<ReturnData<typeof ApproveContactsResponseDto>> {
		const updatedCount = await this.repository.approveContacts(moderatorId, context, ...sources);
		return { updated: updatedCount };
	}

	async suspectSource(
		moderatorId: string | null,
		reason: string,
		context: BlacklistContext,
		endsAt: Date,
		...sources: IBlacklistSource[]
	): Promise<ReturnData<typeof SuspectContactsResponseDto>> {
		if (dayjs(endsAt).isBefore(dayjs())) {
			throw new BadRequestException('Дата истечения не может быть в прошлом');
		}
		const updatedCount = await this.repository.suspectContacts(moderatorId, reason, context, endsAt, ...sources);
		return { updated: updatedCount };
	}

	async markSuspicionAsExpired(): Promise<{ count: number }> {
		const count = await this.repository.markSuspicionAsExpired(new Date());
		return { count };
	}

	async delete(id: string): Promise<ReturnData<typeof DeleteContactFromBlacklistResponseDto>> {
		const count = await this.repository.delete(id);

		return { ok: count > 0 };
	}
}
