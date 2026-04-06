import { Injectable } from '@nestjs/common';
import { campaigns } from '@pif/database';
import { CampaignStatus } from '@pif/shared';
import { CampaignsRepository } from './repositories/campaigns.repository';

@Injectable()
export class CampaignsService {
	constructor(private readonly repository: CampaignsRepository) {}

	findById(id: string): Promise<typeof campaigns.$inferSelect | undefined> {
		return this.repository.findById(id);
	}

	updateStatus(id: string, status: CampaignStatus): Promise<typeof campaigns.$inferSelect | undefined> {
		return this.repository.updateStatus(id, status);
	}

	applyDonation(id: string, amount: number): Promise<typeof campaigns.$inferSelect | undefined> {
		return this.repository.applyDonation(id, amount);
	}

	expirePublishedIfDue(id: string, now: Date = new Date()): Promise<boolean> {
		return this.repository.expirePublishedIfDue(id, now);
	}

	markExpiredAsFailed(now: Date): Promise<string[]> {
		return this.repository.markExpiredAsFailed(now);
	}
}
