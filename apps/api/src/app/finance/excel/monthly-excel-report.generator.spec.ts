import { MonthlyExcelReportGenerator } from './monthly-excel-report.generator';
import { MonthlyExcelReportData } from '../queries/get-monthly-excel-report-data/get-monthly-excel-report-data.query';
import { Logger } from 'nestjs-pino';
import { StorageService } from '@pif/storage';

const baseData = (): MonthlyExcelReportData => ({
	year: 2026,
	month: 3,
	start: new Date(Date.UTC(2026, 2, 1)),
	end: new Date(Date.UTC(2026, 3, 1)),
	summary: {
		totalIncomeNet: 120_000,
		totalExpenseNet: 45_000,
		monthBalanceNet: 75_000,
		endingBalanceNet: 300_000
	},
	donations: [],
	guardianships: [],
	expenses: [],
	reconciliation: {
		totalRows: 0,
		invalidRows: 0
	}
});

describe('MonthlyExcelReportGenerator', () => {
	it('генерирует непустой XLSX buffer', async () => {
		const loggerMock = { error: jest.fn() } as unknown as Logger;
		const storageMock = {
			getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('logo'))
		} as unknown as StorageService;
		const generator = new MonthlyExcelReportGenerator(loggerMock, storageMock);
		const buffer = await generator.generate({
			data: baseData(),
			receiptRedirectBaseUrl: 'https://example.com/finance/public/monthly-ledger/receipts'
		});

		expect(Buffer.isBuffer(buffer)).toBe(true);
		expect(buffer.byteLength).toBeGreaterThan(1000);
	});

	it('возвращает валидный content-type для xlsx', () => {
		const loggerMock = { error: jest.fn() } as unknown as Logger;
		const storageMock = {
			getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('logo'))
		} as unknown as StorageService;
		const generator = new MonthlyExcelReportGenerator(loggerMock, storageMock);
		expect(generator.getContentType()).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	});
});
