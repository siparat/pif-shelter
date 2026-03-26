import { Query } from '@nestjs/cqrs';
import { PublicMonthlyLedgerExcelUrlQueryDto, PublicMonthlyLedgerExcelUrlResponseDto, ReturnDto } from '@pif/contracts';

export class GetPublicMonthlyLedgerExcelUrlQuery extends Query<
	ReturnDto<typeof PublicMonthlyLedgerExcelUrlResponseDto>
> {
	constructor(public readonly dto: PublicMonthlyLedgerExcelUrlQueryDto) {
		super();
	}
}
