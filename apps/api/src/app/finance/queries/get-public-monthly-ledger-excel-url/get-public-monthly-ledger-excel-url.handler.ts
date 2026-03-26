import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PublicMonthlyLedgerExcelUrlResponseDto, ReturnDto } from '@pif/contracts';
import { MonthlyFinanceReportStatusEnum, MonthlyFinanceReportTypeEnum } from '@pif/shared';
import { StorageUrlMapper } from '../../../core/mappers/storage-url.mapper';
import { MonthlyFinanceReportNotFoundException } from '../../exceptions/monthly-finance-report-not-found.exception';
import { MonthlyFinanceReportsRepository } from '../../repositories/monthly-finance-reports.repository';
import { GetPublicMonthlyLedgerExcelUrlQuery } from './get-public-monthly-ledger-excel-url.query';

@QueryHandler(GetPublicMonthlyLedgerExcelUrlQuery)
export class GetPublicMonthlyLedgerExcelUrlHandler implements IQueryHandler<GetPublicMonthlyLedgerExcelUrlQuery> {
	constructor(
		private readonly repository: MonthlyFinanceReportsRepository,
		private readonly config: ConfigService
	) {}

	async execute({
		dto
	}: GetPublicMonthlyLedgerExcelUrlQuery): Promise<ReturnDto<typeof PublicMonthlyLedgerExcelUrlResponseDto>> {
		const report = await this.repository.findByPeriod(
			dto.year,
			dto.month,
			MonthlyFinanceReportTypeEnum.PUBLIC_XLSX
		);
		if (!report || report.status !== MonthlyFinanceReportStatusEnum.SUCCEEDED || !report.storageKey) {
			throw new MonthlyFinanceReportNotFoundException(dto.year, dto.month);
		}

		const endpoint = this.config.getOrThrow<string>('S3_ENDPOINT');
		const bucket = this.config.getOrThrow<string>('S3_BUCKET');
		const url = StorageUrlMapper.getPublicObjectUrl(endpoint, bucket, report.storageKey);
		return {
			url,
			storageKey: report.storageKey
		};
	}
}
