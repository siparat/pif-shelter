import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FinanceController } from './finance.controller';
import { CreateManualExpenseHandler } from './commands/create-manual-expense/create-manual-expense.handler';
import { DeleteManualExpenseHandler } from './commands/delete-manual-expense/delete-manual-expense.handler';
import { RecordLedgerIncomeHandler } from './commands/record-ledger-income/record-ledger-income.handler';
import { UpdateManualExpenseHandler } from './commands/update-manual-expense/update-manual-expense.handler';
import { CanManageManualExpensePolicy } from './policies/can-manage-manual-expense.policy';
import { RecordLedgerIncomePolicy } from './policies/record-ledger-income.policy';
import { GetMonthlyLedgerHandler } from './queries/get-monthly-ledger/get-monthly-ledger.handler';
import { GetPublicMonthlyLedgerHandler } from './queries/get-public-monthly-ledger/get-public-monthly-ledger.handler';
import { AbstractLedgerRepository } from './repositories/abstract-ledger.repository';
import { DrizzleLedgerRepository } from './repositories/drizzle-ledger.repository';

@Module({
	imports: [CqrsModule],
	controllers: [FinanceController],
	providers: [
		CreateManualExpenseHandler,
		UpdateManualExpenseHandler,
		DeleteManualExpenseHandler,
		RecordLedgerIncomeHandler,
		GetMonthlyLedgerHandler,
		GetPublicMonthlyLedgerHandler,
		CanManageManualExpensePolicy,
		RecordLedgerIncomePolicy,
		{
			provide: AbstractLedgerRepository,
			useClass: DrizzleLedgerRepository
		}
	]
})
export class FinanceModule {}
