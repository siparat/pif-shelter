import { CreateAnimalRequestDto } from '@pif/contracts';

export abstract class AnimalsRepository {
	abstract create(data: CreateAnimalRequestDto): Promise<string>;
}
