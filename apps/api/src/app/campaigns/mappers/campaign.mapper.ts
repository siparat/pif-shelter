import { CreateCampaignRequestDto, UpdateCampaignRequestDto } from '@pif/contracts';
import { campaigns } from '@pif/database';
import { CampaignStatus } from '@pif/shared';
import { PgInsertValue, PgUpdateSetSource } from 'drizzle-orm/pg-core';

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

	static toUpdate(dto: UpdateCampaignRequestDto): PgUpdateSetSource<typeof campaigns> {
		return {
			animalId: dto.animalId,
			description: dto.description,
			endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
			startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
			goal: dto.goal,
			title: dto.title,
			previewImage: dto.previewImage
		};
	}
}
