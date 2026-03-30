import { CreateCampaignRequestDto } from '@pif/contracts';
import { campaigns } from '@pif/database';

export abstract class CampaignsRepository {
	abstract create(dto: CreateCampaignRequestDto): Promise<typeof campaigns.$inferSelect>;
	abstract findById(id: string): Promise<typeof campaigns.$inferSelect | undefined>;
}
