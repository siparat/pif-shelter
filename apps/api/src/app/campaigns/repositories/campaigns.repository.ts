import { CreateCampaignRequestDto, UpdateCampaignRequestDto } from '@pif/contracts';
import { campaigns } from '@pif/database';
import { CampaignStatus } from '@pif/shared';

export abstract class CampaignsRepository {
	abstract create(dto: CreateCampaignRequestDto): Promise<typeof campaigns.$inferSelect>;
	abstract update(id: string, dto: UpdateCampaignRequestDto): Promise<typeof campaigns.$inferSelect | undefined>;
	abstract updateStatus(id: string, status: CampaignStatus): Promise<typeof campaigns.$inferSelect | undefined>;
	abstract findById(id: string): Promise<typeof campaigns.$inferSelect | undefined>;
}
