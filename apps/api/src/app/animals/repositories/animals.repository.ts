import { CreateAnimalRequestDto, UpdateAnimalRequestDto } from '@pif/contracts';
import { animals } from '@pif/database';
import { AnimalStatusEnum } from '@pif/shared';

export abstract class AnimalsRepository {
	abstract changeStatus(id: string, status: AnimalStatusEnum): Promise<void>;
	abstract findById(id: string): Promise<typeof animals.$inferSelect | undefined>;
	abstract create(data: CreateAnimalRequestDto): Promise<string>;
	abstract update(id: string, data: UpdateAnimalRequestDto): Promise<string>;
}
