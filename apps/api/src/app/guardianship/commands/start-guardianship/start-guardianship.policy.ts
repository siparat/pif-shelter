import { Injectable } from '@nestjs/common';
import { Animal } from '@pif/database';
import { AnimalNotFoundException } from '../../../animals/exceptions/animal-not-found.exception';
import { AnimalsService } from '../../../animals/animals.service';
import { AnimalAlreadyHasGuardianException } from '../../exceptions/animal-already-has-guardian.exception';
import { AnimalCostOfGuardianshipNotSetException } from '../../exceptions/animal-cost-of-guardianship-not-set.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';

@Injectable()
export class StartGuardianshipPolicy {
	constructor(
		private readonly animalsService: AnimalsService,
		private readonly repository: GuardianshipRepository
	) {}

	async assertCanStart(animalId: string): Promise<Animal> {
		const animal = await this.animalsService.findById(animalId);
		if (!animal) {
			throw new AnimalNotFoundException(animalId);
		}
		const amount = animal.costOfGuardianship != null ? Number(animal.costOfGuardianship) : null;
		if (amount == null || amount <= 0) {
			throw new AnimalCostOfGuardianshipNotSetException(animalId);
		}
		const existing = await this.repository.findActiveOrPendingByAnimalId(animalId);
		if (existing) {
			throw new AnimalAlreadyHasGuardianException();
		}
		return animal;
	}
}
