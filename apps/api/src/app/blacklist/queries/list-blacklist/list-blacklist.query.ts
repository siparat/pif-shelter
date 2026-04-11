import { Query } from '@nestjs/cqrs';
import { ListBlacklistQueryDto, ListBlacklistResult } from '@pif/contracts';

export class ListBlacklistQuery extends Query<ListBlacklistResult> {
	constructor(public readonly dto: ListBlacklistQueryDto) {
		super();
	}
}
