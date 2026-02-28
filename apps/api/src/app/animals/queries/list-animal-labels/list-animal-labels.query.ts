import { Query } from '@nestjs/cqrs';
import { AnimalLabel } from '@pif/database';

export class ListAnimalLabelsQuery extends Query<AnimalLabel[]> {
	constructor() {
		super();
	}
}
