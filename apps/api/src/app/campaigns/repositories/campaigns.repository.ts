import { CreateCampaignRequestDto, UpdateCampaignRequestDto } from '@pif/contracts';
import { campaigns } from '@pif/database';

export abstract class CampaignsRepository {
	abstract create(dto: CreateCampaignRequestDto): Promise<typeof campaigns.$inferSelect>;
	abstract update(id: string, dto: UpdateCampaignRequestDto): Promise<typeof campaigns.$inferSelect | undefined>;
	abstract findById(id: string): Promise<typeof campaigns.$inferSelect | undefined>;
}
