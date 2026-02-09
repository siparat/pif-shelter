import { CreateAnimalDto } from '@pif/contracts';

export interface IAnimalsRepository {
	create(data: CreateAnimalDto): Promise<string>;
}

export const ANIMALS_REPOSITORY = Symbol('ANIMALS_REPOSITORY');
