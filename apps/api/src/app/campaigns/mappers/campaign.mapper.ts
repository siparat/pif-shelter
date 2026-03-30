import { CreateCampaignRequestDto } from '@pif/contracts';
import { campaigns } from '@pif/database';
import { CampaignStatus } from '@pif/shared';
import { PgInsertValue } from 'drizzle-orm/pg-core';

export class CampaignMapper {
	static toInsert(dto: CreateCampaignRequestDto): PgInsertValue<typeof campaigns> {
		return {
			animalId: dto.animalId,
			description: dto.description,
			endsAt: new Date(dto.endsAt),
			startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
			goal: dto.goal,
			title: dto.title,
			previewImage: dto.previewImage,
			status: CampaignStatus.DRAFT
		};
	}
}
