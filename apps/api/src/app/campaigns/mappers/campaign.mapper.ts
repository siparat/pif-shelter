import { animals, campaigns } from '@pif/database';
import { CampaignResponse } from '@pif/contracts';
import { CampaignStatus } from '@pif/shared';
import { PgInsertValue, PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { CreateCampaignRequestDto, UpdateCampaignRequestDto } from '../../core/dto';

type AnimalJoinRow = {
	id: string | null;
	name: string | null;
	avatarUrl: string | null;
	gender: (typeof animals.$inferSelect)['gender'] | null;
	status: (typeof animals.$inferSelect)['status'] | null;
	species: (typeof animals.$inferSelect)['species'] | null;
};

export type CampaignApiSource = {
	id: string;
	title: string;
	description: string | null;
	goal: number;
	collected: number;
	previewImage: string | null;
	status: (typeof campaigns.$inferSelect)['status'];
	startsAt: Date | string;
	endsAt: Date | string;
	createdAt: Date | string;
	updatedAt: Date | string | null;
	deletedAt: Date | string | null;
	animal: AnimalJoinRow | null;
};

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

	static toApiResponse(row: CampaignApiSource): CampaignResponse {
		return {
			id: row.id,
			title: row.title,
			description: row.description,
			coverImageUrl: row.previewImage ?? null,
			targetAmount: row.goal,
			collectedAmount: row.collected,
			status: row.status,
			startsAt: CampaignMapper.toIsoString(row.startsAt),
			endsAt: CampaignMapper.toIsoString(row.endsAt),
			createdAt: CampaignMapper.toIsoString(row.createdAt),
			updatedAt: CampaignMapper.toIsoString(row.updatedAt ?? row.createdAt),
			deletedAt: row.deletedAt == null ? null : CampaignMapper.toIsoString(row.deletedAt),
			animal: CampaignMapper.mapAnimal(row.animal)
		};
	}

	private static toIsoString(value: Date | string): string {
		if (value instanceof Date) {
			return value.toISOString();
		}
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) {
			throw new Error('Invalid campaign timestamp value');
		}
		return parsed.toISOString();
	}

	private static mapAnimal(row: AnimalJoinRow | null): CampaignResponse['animal'] {
		if (row == null || row.id == null) {
			return null;
		}
		if (row.gender == null || row.status == null || row.species == null) {
			return null;
		}
		return {
			id: row.id,
			name: row.name ?? '',
			avatarUrl: row.avatarUrl,
			gender: row.gender,
			status: row.status,
			species: row.species
		};
	}

	static toApiResponseFromDetails(
		row: typeof campaigns.$inferSelect & {
			animal: Pick<
				typeof animals.$inferSelect,
				'id' | 'name' | 'avatarUrl' | 'gender' | 'status' | 'species'
			> | null;
		}
	): CampaignResponse {
		return CampaignMapper.toApiResponse({
			id: row.id,
			title: row.title,
			description: row.description,
			goal: row.goal,
			collected: row.collected,
			previewImage: row.previewImage,
			status: row.status,
			startsAt: row.startsAt,
			endsAt: row.endsAt,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			deletedAt: row.deletedAt,
			animal: row.animal
		});
	}
}
