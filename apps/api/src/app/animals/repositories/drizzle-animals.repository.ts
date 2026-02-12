import { Injectable } from '@nestjs/common';
import { CreateAnimalRequestDto } from '@pif/contracts';
import { animals, DatabaseService } from '@pif/database';
import { AnimalsRepository } from './animals.repository';

@Injectable()
export class DrizzleAnimalsRepository implements AnimalsRepository {
	constructor(private readonly db: DatabaseService) {}

	async create(data: CreateAnimalRequestDto): Promise<string> {
		const [result] = await this.db.client.insert(animals).values(data).returning({ id: animals.id });

		return result.id;
	}
}
