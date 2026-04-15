import { Query } from '@nestjs/cqrs';
import { PublicLedgerReportQueryDto, PublicLedgerReportResponseDto, ReturnData } from '../../../core/dto';

export class GetPublicMonthlyLedgerQuery extends Query<ReturnData<typeof PublicLedgerReportResponseDto>> {
	constructor(public readonly dto: PublicLedgerReportQueryDto) {
		super();
	}
}
