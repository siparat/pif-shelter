import { Query } from '@nestjs/cqrs';
import { ListAnimalsResult } from '@pif/contracts';
import { ListAnimalsRequestDto } from '../../../core/dto';

export class ListAnimalsQuery extends Query<ListAnimalsResult> {
	constructor(public readonly dto: ListAnimalsRequestDto) {
		super();
	}
}
