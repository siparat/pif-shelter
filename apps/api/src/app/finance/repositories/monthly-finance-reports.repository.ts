import { monthlyFinanceReports } from '@pif/database';
import { MonthlyFinanceReportTypeEnum } from '@pif/shared';

export type UpsertPendingMonthlyFinanceReportPayload = {
	year: number;
	month: number;
	reportType: MonthlyFinanceReportTypeEnum;
};

export type MarkMonthlyFinanceReportSucceededPayload = {
	id: string;
	storageKey: string;
	checksumSha256: string;
	generatedAt: Date;
};

export type MarkMonthlyFinanceReportFailedPayload = {
	id: string;
	errorMessage: string;
};

export abstract class MonthlyFinanceReportsRepository {
	abstract findByPeriod(
		year: number,
		month: number,
		reportType: MonthlyFinanceReportTypeEnum
	): Promise<typeof monthlyFinanceReports.$inferSelect | undefined>;
	abstract listSucceededByYear(
		year: number,
		reportType: MonthlyFinanceReportTypeEnum
	): Promise<(typeof monthlyFinanceReports.$inferSelect)[]>;
	abstract upsertPending(
		payload: UpsertPendingMonthlyFinanceReportPayload
	): Promise<typeof monthlyFinanceReports.$inferSelect>;
	abstract markSucceeded(
		payload: MarkMonthlyFinanceReportSucceededPayload
	): Promise<typeof monthlyFinanceReports.$inferSelect | undefined>;
	abstract markFailed(
		payload: MarkMonthlyFinanceReportFailedPayload
	): Promise<typeof monthlyFinanceReports.$inferSelect | undefined>;
}
