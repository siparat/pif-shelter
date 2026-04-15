import { Query } from '@nestjs/cqrs';
import {
	PublicMonthlyLedgerExcelUrlQueryDto,
	PublicMonthlyLedgerExcelUrlResponseDto,
	ReturnData
} from '../../../core/dto';

export class GetPublicMonthlyLedgerExcelUrlQuery extends Query<
	ReturnData<typeof PublicMonthlyLedgerExcelUrlResponseDto>
> {
	constructor(public readonly dto: PublicMonthlyLedgerExcelUrlQueryDto) {
		super();
	}
}
