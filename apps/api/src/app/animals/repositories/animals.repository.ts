import { animals } from '@pif/database';
import { AnimalStatusEnum } from '@pif/shared';
import { CreateAnimalRequestDto, UpdateAnimalRequestDto } from '../../core/dto';

export abstract class AnimalsRepository {
	abstract changeStatus(id: string, status: AnimalStatusEnum): Promise<void>;
	abstract findById(id: string): Promise<typeof animals.$inferSelect | undefined>;
	abstract setNewCostOfGuardianship(id: string, costOfGuardianship: number | null): Promise<void>;
	abstract create(data: CreateAnimalRequestDto): Promise<string>;
	abstract update(id: string, data: UpdateAnimalRequestDto): Promise<string>;
	abstract assignLabel(animalId: string, labelId: string): Promise<void>;
	abstract unassignLabel(animalId: string, labelId: string): Promise<void>;
	abstract setCurator(animalId: string, curatorUserId: string | null): Promise<void>;
}
