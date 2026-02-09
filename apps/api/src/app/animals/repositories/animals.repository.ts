import { Injectable } from '@nestjs/common';
import { CreateAnimalDto } from '@pif/contracts';
import { animals, DatabaseService } from '@pif/database';
import { IAnimalsRepository } from './animals.repository.interface';

@Injectable()
export class AnimalsRepository implements IAnimalsRepository {
	constructor(private readonly db: DatabaseService) {}

	async create(data: CreateAnimalDto): Promise<string> {
		const [result] = await this.db.client
			.insert(animals)
			.values({
				...data,
				birthDate: data.birthDate.toISOString()
			})
			.returning({ id: animals.id });

		return result.id;
	}
}
