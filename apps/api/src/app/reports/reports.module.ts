import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FinanceModule } from '../finance/finance.module';
import { ListPublicReportsByYearHandler } from './queries/list-public-reports-by-year/list-public-reports-by-year.handler';
import { ReportsController } from './reports.controller';

@Module({
	imports: [CqrsModule, FinanceModule],
	controllers: [ReportsController],
	providers: [ListPublicReportsByYearHandler]
})
export class ReportsModule {}
