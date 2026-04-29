import { Injectable } from '@nestjs/common';
import { DatabaseService, monthlyFinanceReports } from '@pif/database';
import { MonthlyFinanceReportStatusEnum, MonthlyFinanceReportTypeEnum } from '@pif/shared';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import {
	MarkMonthlyFinanceReportFailedPayload,
	MarkMonthlyFinanceReportSucceededPayload,
	MonthlyFinanceReportsRepository,
	UpsertPendingMonthlyFinanceReportPayload
} from './monthly-finance-reports.repository';

@Injectable()
export class DrizzleMonthlyFinanceReportsRepository extends MonthlyFinanceReportsRepository {
	constructor(private readonly db: DatabaseService) {
		super();
	}

	findByPeriod(
		year: number,
		month: number,
		reportType: MonthlyFinanceReportTypeEnum
	): Promise<typeof monthlyFinanceReports.$inferSelect | undefined> {
		return this.db.client.query.monthlyFinanceReports.findFirst({
			where: {
				year,
				month,
				reportType
			}
		});
	}

	listSucceededByYear(
		year: number,
		reportType: MonthlyFinanceReportTypeEnum
	): Promise<(typeof monthlyFinanceReports.$inferSelect)[]> {
		return this.db.client
			.select()
			.from(monthlyFinanceReports)
			.where(
				and(
					eq(monthlyFinanceReports.year, year),
					eq(monthlyFinanceReports.reportType, reportType),
					eq(monthlyFinanceReports.status, MonthlyFinanceReportStatusEnum.SUCCEEDED),
					isNotNull(monthlyFinanceReports.storageKey)
				)
			)
			.orderBy(asc(monthlyFinanceReports.month));
	}

	async upsertPending({
		year,
		month,
		reportType
	}: UpsertPendingMonthlyFinanceReportPayload): Promise<typeof monthlyFinanceReports.$inferSelect> {
		const existing = await this.findByPeriod(year, month, reportType);
		if (!existing) {
			const [created] = await this.db.client
				.insert(monthlyFinanceReports)
				.values({
					year,
					month,
					reportType,
					status: MonthlyFinanceReportStatusEnum.PENDING
				})
				.returning();
			return created;
		}

		const [updated] = await this.db.client
			.update(monthlyFinanceReports)
			.set({
				status: MonthlyFinanceReportStatusEnum.PENDING,
				storageKey: null,
				checksumSha256: null,
				generatedAt: null,
				errorMessage: null
			})
			.where(eq(monthlyFinanceReports.id, existing.id))
			.returning();

		return updated;
	}

	async markSucceeded({
		id,
		storageKey,
		checksumSha256,
		generatedAt
	}: MarkMonthlyFinanceReportSucceededPayload): Promise<typeof monthlyFinanceReports.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(monthlyFinanceReports)
			.set({
				status: MonthlyFinanceReportStatusEnum.SUCCEEDED,
				storageKey,
				checksumSha256,
				generatedAt,
				errorMessage: null
			})
			.where(eq(monthlyFinanceReports.id, id))
			.returning();
		return updated;
	}

	async markFailed({
		id,
		errorMessage
	}: MarkMonthlyFinanceReportFailedPayload): Promise<typeof monthlyFinanceReports.$inferSelect | undefined> {
		const [updated] = await this.db.client
			.update(monthlyFinanceReports)
			.set({
				status: MonthlyFinanceReportStatusEnum.FAILED,
				errorMessage
			})
			.where(eq(monthlyFinanceReports.id, id))
			.returning();
		return updated;
	}
}
