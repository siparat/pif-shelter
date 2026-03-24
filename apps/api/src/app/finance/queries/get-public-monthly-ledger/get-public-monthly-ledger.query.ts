import { Query } from '@nestjs/cqrs';
import { PublicLedgerReportQueryDto, PublicLedgerReportResponseDto, ReturnDto } from '@pif/contracts';

export class GetPublicMonthlyLedgerQuery extends Query<ReturnDto<typeof PublicLedgerReportResponseDto>> {
	constructor(public readonly dto: PublicLedgerReportQueryDto) {
		super();
	}
}
