import { Injectable } from '@nestjs/common';
import { CreateCampaignRequestDto, UpdateCampaignRequestDto } from '@pif/contracts';
import { campaigns, DatabaseService } from '@pif/database';
import { CampaignStatus } from '@pif/shared';
import { and, eq, isNull } from 'drizzle-orm';
import { CampaignMapper } from '../mappers/campaign.mapper';
import { CampaignsRepository } from './campaigns.repository';

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

	async updateStatus(id: string, status: CampaignStatus): Promise<typeof campaigns.$inferSelect | undefined> {
		const [campaign] = await this.database.client
			.update(campaigns)
			.set({ status })
			.where(eq(campaigns.id, id))
			.returning();
		return campaign;
	}

	async delete(id: string): Promise<boolean> {
		const [deleted] = await this.database.client
			.update(campaigns)
			.set({ deletedAt: new Date() })
			.where(eq(campaigns.id, id))
			.returning({ id: campaigns.id });
		return Boolean(deleted);
	}

	async findById(id: string): Promise<typeof campaigns.$inferSelect | undefined> {
		const [campaign] = await this.database.client
			.select()
			.from(campaigns)
			.where(and(eq(campaigns.id, id), isNull(campaigns.deletedAt)));
		return campaign;
	}
}
