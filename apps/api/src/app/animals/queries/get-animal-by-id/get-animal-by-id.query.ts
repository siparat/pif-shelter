import { Query } from '@nestjs/cqrs';
import { AnimalDto } from '@pif/contracts';

export class GetAnimalByIdQuery extends Query<AnimalDto> {
	constructor(public readonly id: string) {
		super();
	}
}
