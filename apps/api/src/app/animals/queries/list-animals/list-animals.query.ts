import { Query } from '@nestjs/cqrs';
import { ListAnimalsRequestDto, ListAnimalsResult } from '@pif/contracts';

export class ListAnimalsQuery extends Query<ListAnimalsResult> {
	constructor(public readonly dto: ListAnimalsRequestDto) {
		super();
	}
}
