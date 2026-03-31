import { Injectable } from '@nestjs/common';
import { AppAssets } from '@pif/shared';
import { StorageService } from '@pif/storage';
import exceljs from 'exceljs';
import { Logger } from 'nestjs-pino';
import { MonthlyExcelReportData } from '../queries/get-monthly-excel-report-data/get-monthly-excel-report-data.query';
import {
	FINANCE_EXCEL_COLORS,
	FINANCE_EXCEL_CONTENT_TYPE,
	FINANCE_EXCEL_DATA_ROW_HEIGHT,
	FINANCE_EXCEL_DEFAULT_COLUMN_WIDTH,
	FINANCE_EXCEL_HEADER_ROW_HEIGHT,
	FINANCE_EXCEL_NUMBER_FORMATS,
	FINANCE_EXCEL_SHEET_NAMES
} from './excel-style.constants';

type GenerateMonthlyExcelParams = {
	data: MonthlyExcelReportData;
	receiptRedirectBaseUrl: string;
};

@Injectable()
export class MonthlyExcelReportGenerator {
	constructor(
		private readonly logger: Logger,
		private readonly storage: StorageService
	) {}

	async generate({ data, receiptRedirectBaseUrl }: GenerateMonthlyExcelParams): Promise<Buffer> {
		const workbook = new exceljs.Workbook();
		workbook.creator = 'PIF API';
		workbook.created = new Date();

		const logoImageId = await this.readLogoImage(workbook);

		this.fillSummarySheet(workbook, data, logoImageId);
		this.fillDonationsSheet(workbook, data);
		this.fillGuardianshipsSheet(workbook, data);
		this.fillExpensesSheet(workbook, data, receiptRedirectBaseUrl);
		this.fillMetadataSheet(workbook, data);
		this.fillReconciliationSheet(workbook, data);

		const content = await workbook.xlsx.writeBuffer();
		return Buffer.from(content);
	}

	getContentType(): string {
		return FINANCE_EXCEL_CONTENT_TYPE;
	}

	private async readLogoImage(workbook: exceljs.Workbook): Promise<number | null> {
		try {
			const file = await this.storage.getObjectBuffer(AppAssets.LOGO_DARK_SHORT);
			if (file.length === 0) {
				return null;
			}
			return workbook.addImage({
				buffer: file as unknown as any,
				extension: 'png'
			});
		} catch (e) {
			this.logger.error('Ошибка чтения логотипа из S3', {
				error: e instanceof Error ? e.message : e,
				logoStorageKey: AppAssets.LOGO_DARK_SHORT
			});
			return null;
		}
	}

	private fillSummarySheet(
		workbook: exceljs.Workbook,
		data: MonthlyExcelReportData,
		logoImageId: number | null
	): void {
		const ws = workbook.addWorksheet(FINANCE_EXCEL_SHEET_NAMES.SUMMARY);
		ws.columns = [{ width: 42 }, { width: 28 }];
		ws.addRow(['Показатель', 'Значение']);
		this.styleHeaderRow(ws.getRow(1));

		ws.addRow(['Всего поступило (нетто), RUB', this.toRub(data.summary.totalIncomeNet)]);
		ws.addRow(['Всего потрачено, RUB', this.toRub(data.summary.totalExpenseNet)]);
		ws.addRow(['Сальдо за месяц, RUB', this.toRub(data.summary.monthBalanceNet)]);
		ws.addRow(['Остаток на конец месяца, RUB', this.toRub(data.summary.endingBalanceNet)]);

		for (let i = 2; i <= 5; i += 1) {
			const row = ws.getRow(i);
			row.height = FINANCE_EXCEL_DATA_ROW_HEIGHT;
			row.getCell(2).numFmt = FINANCE_EXCEL_NUMBER_FORMATS.MONEY;
		}

		this.styleTitleCell(ws.getCell('A7'), `Отчет за ${data.month.toString().padStart(2, '0')}.${data.year}`);

		if (logoImageId) {
			ws.addImage(logoImageId, {
				tl: { col: 2.2, row: 0 },
				ext: { width: 88, height: 108 }
			});
		}
	}

	private fillDonationsSheet(workbook: exceljs.Workbook, data: MonthlyExcelReportData): void {
		const ws = workbook.addWorksheet(FINANCE_EXCEL_SHEET_NAMES.DONATIONS);
		ws.columns = [
			{ header: 'Дата', width: 22 },
			{ header: 'Тип', width: 24 },
			{ header: 'Донор', width: 26 },
			{ header: 'Сбор', width: 34 },
			{ header: 'Название', width: 30 },
			{ header: 'Gross, RUB', width: 16 },
			{ header: 'Fee, RUB', width: 16 },
			{ header: 'Net, RUB', width: 16 },
			{ header: 'Provider payment ID', width: 38 }
		];
		this.styleHeaderRow(ws.getRow(1));

		if (data.donations.length === 0) {
			ws.addRow(['Нет записей']);
			return;
		}

		for (const row of data.donations) {
			ws.addRow([
				row.occurredAt,
				row.source === 'DONATION_ONE_OFF' ? 'Разовое' : 'Подписка',
				row.donorDisplayName ?? 'Скрыто',
				row.campaignTitle ?? '—',
				row.title,
				this.toRub(row.grossAmount),
				this.toRub(row.feeAmount),
				this.toRub(row.netAmount),
				row.providerPaymentId ?? '—'
			]);
		}

		this.applyDataStyles(ws, ['A'], ['E', 'F', 'G']);
	}

	private fillGuardianshipsSheet(workbook: exceljs.Workbook, data: MonthlyExcelReportData): void {
		const ws = workbook.addWorksheet(FINANCE_EXCEL_SHEET_NAMES.GUARDIANSHIP);
		ws.columns = [
			{ header: 'Дата', width: 22 },
			{ header: 'Животное', width: 30 },
			{ header: 'Название', width: 34 },
			{ header: 'Net, RUB', width: 16 },
			{ header: 'Provider payment ID', width: 38 },
			{ header: 'Guardianship ID', width: 38 }
		];
		this.styleHeaderRow(ws.getRow(1));

		if (data.guardianships.length === 0) {
			ws.addRow(['Нет записей']);
			return;
		}

		for (const row of data.guardianships) {
			ws.addRow([
				row.occurredAt,
				row.animalName ?? 'Не найдено',
				row.title,
				this.toRub(row.netAmount),
				row.providerPaymentId ?? '—',
				row.guardianshipId ?? '—'
			]);
		}

		this.applyDataStyles(ws, ['A'], ['D']);
	}

	private fillExpensesSheet(
		workbook: exceljs.Workbook,
		data: MonthlyExcelReportData,
		receiptRedirectBaseUrl: string
	): void {
		const ws = workbook.addWorksheet(FINANCE_EXCEL_SHEET_NAMES.EXPENSES);
		ws.columns = [
			{ header: 'Дата', width: 22 },
			{ header: 'Название', width: 34 },
			{ header: 'Заметка', width: 36 },
			{ header: 'Сумма, RUB', width: 16 },
			{ header: 'Чек', width: 24 }
		];
		this.styleHeaderRow(ws.getRow(1));

		if (data.expenses.length === 0) {
			ws.addRow(['Нет записей']);
			return;
		}

		for (const row of data.expenses) {
			const excelRow = ws.addRow([
				row.occurredAt,
				row.title,
				row.note ?? '—',
				this.toRub(row.netAmount),
				row.receiptStorageKey ? 'Открыть чек' : 'Нет чека'
			]);
			if (row.receiptStorageKey) {
				const receiptUrl = `${receiptRedirectBaseUrl}/${row.ledgerEntryId}`;
				excelRow.getCell(5).value = {
					text: 'Открыть чек',
					hyperlink: receiptUrl
				};
				excelRow.getCell(5).font = {
					color: { argb: FINANCE_EXCEL_COLORS.SUCCESS },
					underline: true
				};
			}
		}

		this.applyDataStyles(ws, ['A'], ['D']);
	}

	private fillMetadataSheet(workbook: exceljs.Workbook, data: MonthlyExcelReportData): void {
		const ws = workbook.addWorksheet(FINANCE_EXCEL_SHEET_NAMES.METADATA);
		ws.columns = [{ width: 36 }, { width: 52 }];
		ws.addRow(['Поле', 'Значение']);
		this.styleHeaderRow(ws.getRow(1));
		ws.addRow(['Год', data.year]);
		ws.addRow(['Месяц', data.month]);
		ws.addRow(['Дата генерации (UTC)', new Date()]);
		ws.addRow(['Период от (UTC)', data.start]);
		ws.addRow(['Период до (UTC, не включительно)', data.end]);
		this.applyDataStyles(ws, ['D', 'E'], []);
	}

	private fillReconciliationSheet(workbook: exceljs.Workbook, data: MonthlyExcelReportData): void {
		const ws = workbook.addWorksheet(FINANCE_EXCEL_SHEET_NAMES.RECONCILIATION);
		ws.columns = [{ width: 42 }, { width: 28 }];
		ws.addRow(['Показатель', 'Значение']);
		this.styleHeaderRow(ws.getRow(1));
		ws.addRow(['Количество строк в месяце', data.reconciliation.totalRows]);
		ws.addRow(['Невалидные строки (тех. информация)', data.reconciliation.invalidRows]);
		ws.getCell('B3').font = {
			color: {
				argb: data.reconciliation.invalidRows === 0 ? FINANCE_EXCEL_COLORS.SUCCESS : FINANCE_EXCEL_COLORS.DANGER
			},
			bold: true
		};
	}

	private styleHeaderRow(row: exceljs.Row): void {
		row.height = FINANCE_EXCEL_HEADER_ROW_HEIGHT;
		row.eachCell((cell) => {
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: { argb: FINANCE_EXCEL_COLORS.PRIMARY }
			};
			cell.font = {
				color: { argb: FINANCE_EXCEL_COLORS.WHITE },
				bold: true
			};
			cell.alignment = { vertical: 'middle', horizontal: 'left' };
			cell.border = {
				bottom: {
					style: 'thin',
					color: { argb: FINANCE_EXCEL_COLORS.PRIMARY_DARK }
				}
			};
		});
	}

	private styleTitleCell(cell: exceljs.Cell, value: string): void {
		cell.value = value;
		cell.font = { color: { argb: FINANCE_EXCEL_COLORS.PRIMARY_DARK }, size: 13, bold: true };
	}

	private applyDataStyles(ws: exceljs.Worksheet, dateColumns: string[], moneyColumns: string[]): void {
		if (ws.rowCount <= 1) {
			return;
		}

		for (let rowIndex = 2; rowIndex <= ws.rowCount; rowIndex += 1) {
			const row = ws.getRow(rowIndex);
			row.height = FINANCE_EXCEL_DATA_ROW_HEIGHT;

			for (const col of dateColumns) {
				const dateCell = row.getCell(col);
				if (dateCell.value) {
					dateCell.numFmt = FINANCE_EXCEL_NUMBER_FORMATS.DATE;
				}
			}

			for (const col of moneyColumns) {
				const moneyCell = row.getCell(col);
				if (typeof moneyCell.value === 'number') {
					moneyCell.numFmt = FINANCE_EXCEL_NUMBER_FORMATS.MONEY;
				}
			}

			row.eachCell((cell) => {
				cell.alignment = { vertical: 'middle', horizontal: 'left' };
				cell.border = {
					bottom: {
						style: 'thin',
						color: { argb: FINANCE_EXCEL_COLORS.ACCENT }
					}
				};
			});
		}

		ws.columns.forEach((col) => {
			if (!col.width) {
				col.width = FINANCE_EXCEL_DEFAULT_COLUMN_WIDTH;
			}
		});
	}

	private toRub(kopecks: number): number {
		return Number((kopecks / 100).toFixed(2));
	}
}
