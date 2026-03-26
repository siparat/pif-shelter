export const FINANCE_EXCEL_SHEET_NAMES = {
	SUMMARY: 'Сводка',
	DONATIONS: 'Пожертвования',
	GUARDIANSHIP: 'Опекунства',
	EXPENSES: 'Расходы',
	METADATA: 'Метаданные',
	RECONCILIATION: 'Сверка'
} as const;

export const FINANCE_EXCEL_COLORS = {
	PRIMARY: 'FF4F3D38',
	PRIMARY_DARK: 'FF483834',
	ACCENT: 'FFF0E7D6',
	SUCCESS: 'FF2E7D32',
	DANGER: 'FFC62828',
	NEUTRAL: 'FF6B625D',
	WHITE: 'FFFFFFFF'
} as const;

export const FINANCE_EXCEL_NUMBER_FORMATS = {
	MONEY: '#,##0.00',
	INTEGER_MONEY: '#,##0',
	DATE: 'dd.mm.yyyy hh:mm'
} as const;

export const FINANCE_EXCEL_DEFAULT_COLUMN_WIDTH = 22;
export const FINANCE_EXCEL_HEADER_ROW_HEIGHT = 24;
export const FINANCE_EXCEL_DATA_ROW_HEIGHT = 20;

export const FINANCE_EXCEL_PUBLIC_REPORT_FOLDER = 'reports/monthly-ledger-excel';
export const FINANCE_EXCEL_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
