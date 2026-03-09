import { Injectable } from '@nestjs/common';
import { CreateAnimalRequestDto, UpdateAnimalRequestDto } from '@pif/contracts';
import { animals, animalsToAnimalLabels, DatabaseService } from '@pif/database';
import { AnimalStatusEnum } from '@pif/shared';
import { and, eq } from 'drizzle-orm';
import { AnimalNotFoundException } from '../exceptions/animal-not-found.exception';
import { AnimalMapper } from '../mappers/animal.mapper';
import { AnimalsRepository } from './animals.repository';

@Injectable()
export class DrizzleAnimalsRepository implements AnimalsRepository {
	constructor(private readonly db: DatabaseService) {}

	findById(id: string): Promise<typeof animals.$inferSelect | undefined> {
		return this.db.client.query.animals.findFirst({ where: { id } });
	}

	async setNewCostOfGuardianship(id: string, costOfGuardianship: number | null): Promise<void> {
		await this.db.client.update(animals).set({ costOfGuardianship }).where(eq(animals.id, id));
	}

	async changeStatus(id: string, status: AnimalStatusEnum): Promise<void> {
		await this.db.client.update(animals).set({ status }).where(eq(animals.id, id));
	}

	async create(data: CreateAnimalRequestDto): Promise<string> {
		const values = AnimalMapper.fromCreateDTO(data);
		const [result] = await this.db.client.insert(animals).values(values).returning({ id: animals.id });

		return result.id;
	}

	async update(id: string, data: UpdateAnimalRequestDto): Promise<string> {
		const values = AnimalMapper.fromUpdateDTO(data);

		if (Object.keys(values).length === 0) {
			return id;
		}

		const [updated] = await this.db.client
			.update(animals)
			.set(values)
			.where(eq(animals.id, id))
			.returning({ id: animals.id });

		if (!updated) {
			throw new AnimalNotFoundException(id);
		}

		return updated.id;
	}

	async assignLabel(animalId: string, labelId: string): Promise<void> {
		await this.db.client.insert(animalsToAnimalLabels).values({ animalId, labelId }).onConflictDoNothing();
	}

	async unassignLabel(animalId: string, labelId: string): Promise<void> {
		await this.db.client
			.delete(animalsToAnimalLabels)
			.where(and(eq(animalsToAnimalLabels.animalId, animalId), eq(animalsToAnimalLabels.labelId, labelId)));
	}

	async setCurator(animalId: string, curatorUserId: string | null): Promise<void> {
		await this.db.client
			.update(animals)
			.set({ curatorId: curatorUserId })
			.where(eq(animals.id, animalId))
			.returning({ id: animals.id });
	}
}
