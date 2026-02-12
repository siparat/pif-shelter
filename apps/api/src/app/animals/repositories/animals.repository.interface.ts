import { CreateAnimalDto } from '@pif/contracts';

export abstract class IAnimalsRepository {
	abstract create(data: CreateAnimalDto): Promise<string>;
}
