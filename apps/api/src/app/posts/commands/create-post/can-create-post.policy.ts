import { Injectable } from '@nestjs/common';
import { Animal } from '@pif/database';
import { UserRole } from '@pif/shared';
import { AnimalsService } from '../../../animals/animals.service';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { InsufficientRoleException } from '../../exceptions/insufficient-role.exception';
import { NotCuratorException } from '../../exceptions/not-curator.exception';

@Injectable()
export class CanCreatePostPolicy {
	constructor(private readonly animalsService: AnimalsService) {}

	async assertCanCreatePost(animalId: string, userId: string, userRole: UserRole): Promise<Animal> {
		const animal = await this.animalsService.findById(animalId);
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
			throw new NotCuratorException();
		}
		throw new InsufficientRoleException();
	}
}
