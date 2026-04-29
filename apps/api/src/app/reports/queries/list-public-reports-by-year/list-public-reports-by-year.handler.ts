import { ConfigService } from '@nestjs/config';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { MonthlyFinanceReportTypeEnum } from '@pif/shared';
import { ListPublicReportsByYearResponseDto, ReturnData } from '../../../core/dto';
import { StorageUrlMapper } from '../../../core/mappers/storage-url.mapper';
import { MonthlyFinanceReportsRepository } from '../../../finance/repositories/monthly-finance-reports.repository';
import { ListPublicReportsByYearQuery } from './list-public-reports-by-year.query';

const MONTH_NAMES_RU = [
	'Январь',
	'Февраль',
	'Март',
	'Апрель',
	'Май',
	'Июнь',
	'Июль',
	'Август',
	'Сентябрь',
	'Октябрь',
	'Ноябрь',
	'Декабрь'
];

@QueryHandler(ListPublicReportsByYearQuery)
export class ListPublicReportsByYearHandler implements IQueryHandler<ListPublicReportsByYearQuery> {
	constructor(
		private readonly financeReportsRepository: MonthlyFinanceReportsRepository,
		private readonly config: ConfigService
	) {}

	async execute({
		dto
	}: ListPublicReportsByYearQuery): Promise<ReturnData<typeof ListPublicReportsByYearResponseDto>> {
		const endpoint = this.config.getOrThrow<string>('S3_ENDPOINT');
		const bucket = this.config.getOrThrow<string>('S3_BUCKET');

		const monthlyFinance = await this.financeReportsRepository.listSucceededByYear(
			dto.year,
			MonthlyFinanceReportTypeEnum.PUBLIC_XLSX
		);

		return monthlyFinance
			.filter((report) => report.storageKey !== null)
			.map((report) => ({
				id: report.id,
				category: 'FINANCE' as const,
				title: `${MONTH_NAMES_RU[report.month - 1]} ${report.year}`,
				year: report.year,
				month: report.month,
				fileType: 'XLSX' as const,
				url: StorageUrlMapper.getPublicObjectUrl(endpoint, bucket, report.storageKey as string)
			}));
	}
}
