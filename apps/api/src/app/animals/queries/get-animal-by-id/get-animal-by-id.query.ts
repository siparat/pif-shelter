import { Query } from '@nestjs/cqrs';
import { AnimalDto } from '../../../core/dto';

export class GetAnimalByIdQuery extends Query<AnimalDto> {
	constructor(public readonly id: string) {
		super();
	}
}
