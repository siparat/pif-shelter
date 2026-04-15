import { Query } from '@nestjs/cqrs';
import { ListBlacklistResult } from '@pif/contracts';
import { ListBlacklistQueryDto } from '../../../core/dto';

export class ListBlacklistQuery extends Query<ListBlacklistResult> {
	constructor(public readonly dto: ListBlacklistQueryDto) {
		super();
	}
}
