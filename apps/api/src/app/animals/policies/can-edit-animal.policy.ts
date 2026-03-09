import { Injectable } from '@nestjs/common';
import { UserRole } from '@pif/shared';
import { AnimalNotFoundException } from '../exceptions/animal-not-found.exception';
import { AnimalNotEditableByUserException } from '../exceptions/animal-not-editable-by-user.exception';
import { AnimalsRepository } from '../repositories/animals.repository';
import { animals } from '@pif/database';

@Injectable()
export class CanEditAnimalPolicy {
	constructor(private readonly repository: AnimalsRepository) {}

	async assertCanEdit(animalId: string, userId: string, userRole: UserRole): Promise<typeof animals.$inferSelect> {
		const animal = await this.repository.findById(animalId);
		if (!animal) {
			throw new AnimalNotFoundException(animalId);
		}
		if (userRole === UserRole.ADMIN || userRole === UserRole.SENIOR_VOLUNTEER) {
			return animal;
		}
		if (userRole === UserRole.VOLUNTEER) {
			if (animal.curatorId === userId) {
				return animal;
			}
			throw new AnimalNotEditableByUserException();
		}
		throw new AnimalNotEditableByUserException();
	}
}
