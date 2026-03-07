import { Injectable } from '@nestjs/common';
import { Animal } from '@pif/database';
import { AnimalsRepository } from './repositories/animals.repository';

@Injectable()
export class AnimalsService {
	constructor(private repository: AnimalsRepository) {}

	findById(animalId: string): Promise<Animal | undefined> {
		return this.repository.findById(animalId);
	}
}
