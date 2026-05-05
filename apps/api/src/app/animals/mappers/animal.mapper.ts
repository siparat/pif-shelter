import { animals } from '@pif/database';
import { AnimalCoatNames, AnimalGenderEnum, AnimalGenderNames, AnimalSizeNames, AnimalSpeciesNames } from '@pif/shared';
import { InferInsertModel } from 'drizzle-orm';
import { CreateAnimalRequestDto, UpdateAnimalRequestDto } from '../../core/dto';

type AnimalInsertModel = InferInsertModel<typeof animals>;

export interface AnimalAiData {
	id: string;
	name: string;
	species: string;
	gender: string;
	age: string;
	size: string;
	coat: string;
	color: string;
	tags: string | null;
	isSterilized: boolean;
	isVaccinated: boolean;
	description: string | null;
	posts: string[] | null;
}

export class AnimalMapper {
	static fromCreateDTO(dto: CreateAnimalRequestDto): AnimalInsertModel {
		return {
			name: dto.name,
			species: dto.species,
			gender: dto.gender,
			birthDate: dto.birthDate,
			size: dto.size,
			coat: dto.coat,
			color: dto.color,
			description: dto.description,
			isSterilized: dto.isSterilized,
			isVaccinated: dto.isVaccinated,
			isParasiteTreated: dto.isParasiteTreated,
			avatarUrl: dto.avatarKey
		};
	}

	static fromUpdateDTO(dto: UpdateAnimalRequestDto): Partial<AnimalInsertModel> {
		const updateData: Partial<AnimalInsertModel> = {};

		if (dto.name) updateData.name = dto.name;
		if (dto.species) updateData.species = dto.species;
		if (dto.gender) updateData.gender = dto.gender;
		if (dto.birthDate) updateData.birthDate = dto.birthDate;
		if (dto.size) updateData.size = dto.size;
		if (dto.coat) updateData.coat = dto.coat;
		if (dto.color) updateData.color = dto.color;
		if (dto.description) updateData.description = dto.description;
		if (dto.isSterilized !== undefined) updateData.isSterilized = dto.isSterilized;
		if (dto.isVaccinated !== undefined) updateData.isVaccinated = dto.isVaccinated;
		if (dto.isParasiteTreated !== undefined) updateData.isParasiteTreated = dto.isParasiteTreated;
		if (dto.avatarKey) updateData.avatarUrl = dto.avatarKey;

		return updateData;
	}

	static toAiAnimalData(
		a: Omit<
			typeof animals.$inferSelect,
			| 'isParasiteTreated'
			| 'avatarUrl'
			| 'galleryUrl'
			| 'status'
			| 'galleryUrls'
			| 'costOfGuardianship'
			| 'createdAt'
			| 'updatedAt'
			| 'deletedAt'
			| 'curatorId'
		>,
		postSnippets: string[]
	): AnimalAiData {
		const calcAge = (birthDate: string): string => {
			const birth = new Date(birthDate);
			const now = new Date();
			let years = now.getFullYear() - birth.getFullYear();
			let months = now.getMonth() - birth.getMonth();
			if (months < 0) {
				years -= 1;
				months += 12;
			}
			const parts: string[] = [];
			if (years > 0) parts.push(`${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`);
			if (months > 0) parts.push(`${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`);
			return parts.join(' ') || 'менее месяца';
		};

		return {
			id: a.id,
			name: a.name,
			species: AnimalSpeciesNames[a.species],
			gender: AnimalGenderNames[a.gender],
			age: calcAge(a.birthDate),
			size: AnimalSizeNames[a.size][a.gender as AnimalGenderEnum],
			coat: AnimalCoatNames[a.coat],
			color: a.color,
			tags: (a.tags ?? []).join(', ') || null,
			isSterilized: a.isSterilized,
			isVaccinated: a.isVaccinated,
			description: a.description ? a.description.slice(0, 300) : null,
			posts: postSnippets.length > 0 ? postSnippets : null
		};
	}
}
