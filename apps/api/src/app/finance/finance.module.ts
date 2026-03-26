import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FINANCE_REPORTS_QUEUE_NAME } from '@pif/shared';
import { CreateManualExpenseHandler } from './commands/create-manual-expense/create-manual-expense.handler';
import { DeleteManualExpenseHandler } from './commands/delete-manual-expense/delete-manual-expense.handler';
import { GenerateMonthlyFinanceReportHandler } from './commands/generate-monthly-finance-report/generate-monthly-finance-report.handler';
import { RecordLedgerIncomeHandler } from './commands/record-ledger-income/record-ledger-income.handler';
import { UpdateManualExpenseHandler } from './commands/update-manual-expense/update-manual-expense.handler';
import { MonthlyExcelReportGenerator } from './excel/monthly-excel-report.generator';
import { FinanceReportsProcessor } from './finance-reports.processor';
import { FinanceReportsScheduler } from './finance-reports.scheduler';
import { FinanceController } from './finance.controller';
import { CanManageManualExpensePolicy } from './policies/can-manage-manual-expense.policy';
import { RecordLedgerIncomePolicy } from './policies/record-ledger-income.policy';
import { GetMonthlyExcelReportDataHandler } from './queries/get-monthly-excel-report-data/get-monthly-excel-report-data.handler';
import { GetMonthlyLedgerHandler } from './queries/get-monthly-ledger/get-monthly-ledger.handler';
import { GetPublicLedgerReceiptRedirectHandler } from './queries/get-public-ledger-receipt-redirect/get-public-ledger-receipt-redirect.handler';
import { GetPublicMonthlyLedgerExcelUrlHandler } from './queries/get-public-monthly-ledger-excel-url/get-public-monthly-ledger-excel-url.handler';
import { GetPublicMonthlyLedgerHandler } from './queries/get-public-monthly-ledger/get-public-monthly-ledger.handler';
import { DrizzleLedgerRepository } from './repositories/drizzle-ledger.repository';
import { DrizzleMonthlyFinanceReportsRepository } from './repositories/drizzle-monthly-finance-reports.repository';
import { LedgerRepository } from './repositories/ledger.repository';
import { MonthlyFinanceReportsRepository } from './repositories/monthly-finance-reports.repository';

@Module({
	imports: [BullModule.registerQueue({ name: FINANCE_REPORTS_QUEUE_NAME }), CqrsModule],
	controllers: [FinanceController],
	providers: [
		CreateManualExpenseHandler,
		UpdateManualExpenseHandler,
		DeleteManualExpenseHandler,
		GenerateMonthlyFinanceReportHandler,
		RecordLedgerIncomeHandler,
		GetMonthlyLedgerHandler,
		GetPublicMonthlyLedgerHandler,
		GetPublicMonthlyLedgerExcelUrlHandler,
		GetPublicLedgerReceiptRedirectHandler,
		GetMonthlyExcelReportDataHandler,
		CanManageManualExpensePolicy,
		RecordLedgerIncomePolicy,
		MonthlyExcelReportGenerator,
		FinanceReportsProcessor,
		FinanceReportsScheduler,
		{
			provide: LedgerRepository,
			useClass: DrizzleLedgerRepository
		},
		{
			provide: MonthlyFinanceReportsRepository,
			useClass: DrizzleMonthlyFinanceReportsRepository
		}
	]
})
export class FinanceModule {}
