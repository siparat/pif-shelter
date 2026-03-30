import { Injectable } from '@nestjs/common';
import { CreateCampaignRequestDto } from '@pif/contracts';
import { AnimalStatusEnum } from '@pif/shared';
import { AnimalsService } from '../../animals/animals.service';
import { AnimalIsNotWithUsException } from '../exceptions/animal-is-not-with-us.exception';
import { AnimalNotFoundException } from '../exceptions/animal-not-found.exception';
import { InvalidTimeIntervalException } from '../exceptions/invalid-time-interval.exception';

@Injectable()
export class CanCreateCampaignPolicy {
	constructor(private readonly animalsService: AnimalsService) {}

	async assertCanCreate(dto: CreateCampaignRequestDto): Promise<void> {
		if (new Date(dto.startsAt || Date.now()).getTime() >= new Date(dto.endsAt).getTime()) {
			throw new InvalidTimeIntervalException();
		}
		if (dto.animalId) {
			const animal = await this.animalsService.findById(dto.animalId);
			if (!animal) {
				throw new AnimalNotFoundException();
			}
			if (
				animal.status === AnimalStatusEnum.ADOPTED ||
				animal.status === AnimalStatusEnum.RAINBOW ||
				animal.status === AnimalStatusEnum.DRAFT
			) {
				throw new AnimalIsNotWithUsException(animal.name);
			}
		}
	}
}
