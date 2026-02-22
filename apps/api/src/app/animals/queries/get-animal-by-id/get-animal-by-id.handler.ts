import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AnimalDto } from '@pif/contracts';
import { DatabaseService } from '@pif/database';
import { AnimalNotFoundException } from '../../exceptions/animal-not-found.exception';
import { GetAnimalByIdQuery } from './get-animal-by-id.query';

@QueryHandler(GetAnimalByIdQuery)
export class GetAnimalByIdHandler implements IQueryHandler<GetAnimalByIdQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute(query: GetAnimalByIdQuery): Promise<AnimalDto> {
		const animal = await this.db.client.query.animals.findFirst({
			where: { id: query.id },
			with: { labels: true }
		});

		if (!animal) {
			throw new AnimalNotFoundException(query.id);
		}

		return animal;
	}
}
