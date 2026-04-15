import { Query } from '@nestjs/cqrs';
import { ListLedgerForMonthQueryDto, ListLedgerForMonthResponseDto, ReturnData } from '../../../core/dto';

export class GetMonthlyLedgerQuery extends Query<ReturnData<typeof ListLedgerForMonthResponseDto>> {
	constructor(public readonly dto: ListLedgerForMonthQueryDto) {
		super();
	}
}
