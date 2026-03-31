import { Injectable } from '@nestjs/common';
import { CreateCampaignRequestDto, UpdateCampaignRequestDto } from '@pif/contracts';
import { campaigns } from '@pif/database';
import { AnimalStatusEnum } from '@pif/shared';
import { AnimalsService } from '../../animals/animals.service';
import { AnimalIsNotWithUsException } from '../exceptions/animal-is-not-with-us.exception';
import { AnimalNotFoundException } from '../exceptions/animal-not-found.exception';
import { InvalidTimeIntervalException } from '../exceptions/invalid-time-interval.exception';

@Injectable()
export class CanCreateCampaignPolicy {
	constructor(private readonly animalsService: AnimalsService) {}

	async assertCanCreate(dto: CreateCampaignRequestDto): Promise<void> {
		const startsAt = dto.startsAt ? new Date(dto.startsAt) : new Date();
		const endsAt = new Date(dto.endsAt);
		if (startsAt.getTime() >= endsAt.getTime()) {
			throw new InvalidTimeIntervalException();
		}
		await this.assertAnimalIsAvailable(dto.animalId);
	}

	async assertCanUpdate(campaign: typeof campaigns.$inferSelect, dto: UpdateCampaignRequestDto): Promise<void> {
		const startsAt = dto.startsAt ? new Date(dto.startsAt) : campaign.startsAt;
		const endsAt = dto.endsAt ? new Date(dto.endsAt) : campaign.endsAt;
		if (startsAt.getTime() >= endsAt.getTime()) {
			throw new InvalidTimeIntervalException();
		}
		if (dto.animalId !== undefined) {
			await this.assertAnimalIsAvailable(dto.animalId);
		}
	}

	private async assertAnimalIsAvailable(animalId?: string | null): Promise<void> {
		if (!animalId) {
			return;
		}
		const animal = await this.animalsService.findById(animalId);
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
