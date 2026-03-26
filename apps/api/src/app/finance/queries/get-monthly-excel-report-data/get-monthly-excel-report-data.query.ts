import { Query } from '@nestjs/cqrs';
import { LedgerEntrySourceEnum } from '@pif/shared';

export type MonthlyExcelSummary = {
	totalIncomeNet: number;
	totalExpenseNet: number;
	monthBalanceNet: number;
	endingBalanceNet: number;
};

export type MonthlyExcelDonationRow = {
	occurredAt: Date;
	source: LedgerEntrySourceEnum.DONATION_ONE_OFF | LedgerEntrySourceEnum.DONATION_SUBSCRIPTION;
	donorDisplayName: string | null;
	title: string;
	grossAmount: number;
	feeAmount: number;
	netAmount: number;
	providerPaymentId: string | null;
};

export type MonthlyExcelGuardianshipRow = {
	occurredAt: Date;
	animalName: string | null;
	title: string;
	netAmount: number;
	providerPaymentId: string | null;
	guardianshipId: string | null;
};

export type MonthlyExcelExpenseRow = {
	ledgerEntryId: string;
	occurredAt: Date;
	title: string;
	note: string | null;
	netAmount: number;
	receiptStorageKey: string | null;
};

export type MonthlyExcelReconciliation = {
	totalRows: number;
	invalidRows: number;
};

export type MonthlyExcelReportData = {
	year: number;
	month: number;
	start: Date;
	end: Date;
	summary: MonthlyExcelSummary;
	donations: MonthlyExcelDonationRow[];
	guardianships: MonthlyExcelGuardianshipRow[];
	expenses: MonthlyExcelExpenseRow[];
	reconciliation: MonthlyExcelReconciliation;
};

export class GetMonthlyExcelReportDataQuery extends Query<MonthlyExcelReportData> {
	constructor(
		public readonly year: number,
		public readonly month: number
	) {
		super();
	}
}
