import { NotFoundException } from '@nestjs/common';

export class MonthlyFinanceReportNotFoundException extends NotFoundException {
	constructor(year: number, month: number) {
		super(`Ежемесячный отчет ${year}-${String(month).padStart(2, '0')} не найден`);
	}
}
