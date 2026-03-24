import { Query } from '@nestjs/cqrs';
import { ListLedgerForMonthQueryDto, ReturnDto, ListLedgerForMonthResponseDto } from '@pif/contracts';

export class GetMonthlyLedgerQuery extends Query<ReturnDto<typeof ListLedgerForMonthResponseDto>> {
	constructor(public readonly dto: ListLedgerForMonthQueryDto) {
		super();
	}
}
