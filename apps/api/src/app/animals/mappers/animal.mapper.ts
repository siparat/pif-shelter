import { CreateAnimalRequestDto, UpdateAnimalRequestDto } from '@pif/contracts';
import { animals } from '@pif/database';
import { InferInsertModel } from 'drizzle-orm';

type AnimalInsertModel = InferInsertModel<typeof animals>;

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
}
