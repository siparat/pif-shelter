import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Animal } from '@pif/database';
import { UserRole } from '@pif/shared';
import { AnimalsService } from '../../../animals/animals.service';

@Injectable()
export class CanCreatePostPolicy {
	constructor(private readonly animalsService: AnimalsService) {}

	async assertCanCreatePost(animalId: string, userId: string, userRole: UserRole): Promise<Animal> {
		const animal = await this.animalsService.findById(animalId);
		if (!animal) {
			throw new NotFoundException('Животное не найдено');
		}
		if (userRole === UserRole.ADMIN || userRole === UserRole.SENIOR_VOLUNTEER) {
			return animal;
		}
		if (userRole === UserRole.VOLUNTEER) {
			if (animal.curatorId === userId) {
				return animal;
			}
			throw new ForbiddenException(
				'Создавать посты может только куратор этого животного или сотрудник с большими правами'
			);
		}
		throw new ForbiddenException('Недостаточно прав для создания поста');
	}
}
