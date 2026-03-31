import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
	animals,
	campaigns,
	DatabaseService,
	donationOneTimeIntents,
	guardianships,
	ledgerEntries
} from '@pif/database';
import { LedgerEntryDirectionEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { and, asc, eq, gte, lt, lte } from 'drizzle-orm';
import {
	GetMonthlyExcelReportDataQuery,
	MonthlyExcelDonationRow,
	MonthlyExcelExpenseRow,
	MonthlyExcelReportData
} from './get-monthly-excel-report-data.query';

@QueryHandler(GetMonthlyExcelReportDataQuery)
export class GetMonthlyExcelReportDataHandler implements IQueryHandler<GetMonthlyExcelReportDataQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute({ year, month }: GetMonthlyExcelReportDataQuery): Promise<MonthlyExcelReportData> {
		const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
		const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

		const monthRows = await this.db.client
			.select({
				id: ledgerEntries.id,
				direction: ledgerEntries.direction,
				source: ledgerEntries.source,
				grossAmount: ledgerEntries.grossAmount,
				feeAmount: ledgerEntries.feeAmount,
				netAmount: ledgerEntries.netAmount,
				currency: ledgerEntries.currency,
				occurredAt: ledgerEntries.occurredAt,
				title: ledgerEntries.title,
				note: ledgerEntries.note,
				donorDisplayName: ledgerEntries.donorDisplayName,
				providerPaymentId: ledgerEntries.providerPaymentId,
				donationOneTimeIntentId: ledgerEntries.donationOneTimeIntentId,
				donationSubscriptionId: ledgerEntries.donationSubscriptionId,
				guardianshipId: ledgerEntries.guardianshipId,
				receiptStorageKey: ledgerEntries.receiptStorageKey,
				createdByUserId: ledgerEntries.createdByUserId,
				campaignId: campaigns.id,
				campaignTitle: campaigns.title
			})
			.from(ledgerEntries)
			.leftJoin(donationOneTimeIntents, eq(ledgerEntries.donationOneTimeIntentId, donationOneTimeIntents.id))
			.leftJoin(campaigns, eq(donationOneTimeIntents.campaignId, campaigns.id))
			.where(and(gte(ledgerEntries.occurredAt, start), lt(ledgerEntries.occurredAt, end)))
			.orderBy(asc(ledgerEntries.occurredAt));

		const rowsUntilEnd = await this.db.client
			.select({
				direction: ledgerEntries.direction,
				netAmount: ledgerEntries.netAmount
			})
			.from(ledgerEntries)
			.where(lte(ledgerEntries.occurredAt, end));

		let invalidRows = 0;
		let totalIncomeNet = 0;
		let totalExpenseNet = 0;

		const expenses: MonthlyExcelExpenseRow[] = [];
		const donations: MonthlyExcelDonationRow[] = [];

		for (const row of monthRows) {
			invalidRows += row.grossAmount === row.feeAmount + row.netAmount ? 0 : 1;
			if (row.direction === LedgerEntryDirectionEnum.INCOME) {
				totalIncomeNet += row.netAmount;
			} else {
				totalExpenseNet += row.netAmount;
			}

			if (row.direction === LedgerEntryDirectionEnum.EXPENSE) {
				expenses.push({
					ledgerEntryId: row.id,
					occurredAt: row.occurredAt,
					title: row.title,
					note: row.note ?? null,
					netAmount: row.netAmount,
					receiptStorageKey: row.receiptStorageKey ?? null
				});
			}

			if (
				row.source === LedgerEntrySourceEnum.DONATION_SUBSCRIPTION ||
				row.source === LedgerEntrySourceEnum.DONATION_ONE_OFF
			) {
				donations.push({
					occurredAt: row.occurredAt,
					source: row.source,
					donorDisplayName: row.donorDisplayName ?? null,
					campaignId: row.campaignId ?? null,
					campaignTitle: row.campaignTitle ?? null,
					title: row.title,
					grossAmount: row.grossAmount,
					feeAmount: row.feeAmount,
					netAmount: row.netAmount,
					providerPaymentId: row.providerPaymentId ?? null
				});
			}
		}
		const monthBalanceNet = totalIncomeNet - totalExpenseNet;

		const endingBalanceNet = rowsUntilEnd.reduce(
			(sum, row) => sum + (row.direction === LedgerEntryDirectionEnum.INCOME ? row.netAmount : -row.netAmount),
			0
		);

		const guardianshipRows = await this.db.client
			.select({
				id: ledgerEntries.id,
				occurredAt: ledgerEntries.occurredAt,
				title: ledgerEntries.title,
				netAmount: ledgerEntries.netAmount,
				providerPaymentId: ledgerEntries.providerPaymentId,
				guardianshipId: ledgerEntries.guardianshipId,
				animalName: animals.name
			})
			.from(ledgerEntries)
			.leftJoin(guardianships, eq(ledgerEntries.guardianshipId, guardianships.id))
			.leftJoin(animals, eq(guardianships.animalId, animals.id))
			.where(
				and(
					gte(ledgerEntries.occurredAt, start),
					lt(ledgerEntries.occurredAt, end),
					eq(ledgerEntries.source, LedgerEntrySourceEnum.GUARDIANSHIP)
				)
			)
			.orderBy(asc(ledgerEntries.occurredAt));

		return {
			year,
			month,
			start,
			end,
			summary: {
				totalIncomeNet,
				totalExpenseNet,
				monthBalanceNet,
				endingBalanceNet
			},
			donations,
			expenses,
			guardianships: guardianshipRows.map((row) => ({
				occurredAt: row.occurredAt,
				animalName: row.animalName ?? null,
				title: row.title,
				netAmount: row.netAmount,
				providerPaymentId: row.providerPaymentId ?? null,
				guardianshipId: row.guardianshipId ?? null
			})),
			reconciliation: { totalRows: monthRows.length, invalidRows }
		};
	}
}
