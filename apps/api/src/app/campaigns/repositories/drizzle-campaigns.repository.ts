import { CreateCampaignRequestDto, UpdateCampaignRequestDto } from '@pif/contracts';
import { campaigns, DatabaseService } from '@pif/database';
import { CampaignMapper } from '../mappers/campaign.mapper';
import { CampaignsRepository } from './campaigns.repository';
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class DrizzleCampaignsRepository extends CampaignsRepository {
	constructor(private readonly database: DatabaseService) {
		super();
	}

	async create(dto: CreateCampaignRequestDto): Promise<typeof campaigns.$inferSelect> {
		const [campaign] = await this.database.client
			.insert(campaigns)
			.values(CampaignMapper.toInsert(dto))
			.returning();
		return campaign;
	}

	async update(id: string, dto: UpdateCampaignRequestDto): Promise<typeof campaigns.$inferSelect | undefined> {
		const [campaign] = await this.database.client
			.update(campaigns)
			.set(CampaignMapper.toUpdate(dto))
			.where(eq(campaigns.id, id))
			.returning();
		return campaign;
	}

	async findById(id: string): Promise<typeof campaigns.$inferSelect | undefined> {
		return this.database.client.query.campaigns.findFirst({ where: { id } });
	}
}
