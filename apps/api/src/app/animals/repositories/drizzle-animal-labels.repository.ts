import { Injectable } from '@nestjs/common';
import { AnimalLabel, DatabaseService, animalLabelColumns, animalLabels } from '@pif/database';
import { eq } from 'drizzle-orm';
import { AnimalLabelsRepository } from './animal-labels.repository';

@Injectable()
export class DrizzleAnimalLabelsRepository implements AnimalLabelsRepository {
	constructor(private readonly db: DatabaseService) {}

	async findById(id: string): Promise<AnimalLabel | undefined> {
		return this.db.client.query.animalLabels.findFirst({
			where: { id },
			columns: animalLabelColumns
		});
	}

	async findByName(name: string): Promise<AnimalLabel | undefined> {
		return this.db.client.query.animalLabels.findFirst({
			where: { name },
			columns: animalLabelColumns
		});
	}

	async create(data: { name: string; color: string }): Promise<string> {
		const [result] = await this.db.client.insert(animalLabels).values(data).returning({ id: animalLabels.id });
		return result.id;
	}

	async update(id: string, data: Partial<{ name: string; color: string }>): Promise<AnimalLabel> {
		const [label] = await this.db.client.update(animalLabels).set(data).where(eq(animalLabels.id, id)).returning();
		return label;
	}

	async delete(id: string): Promise<void> {
		await this.db.client.delete(animalLabels).where(eq(animalLabels.id, id));
	}
}
