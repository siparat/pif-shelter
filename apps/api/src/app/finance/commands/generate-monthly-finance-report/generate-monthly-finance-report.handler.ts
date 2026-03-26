import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { MonthlyFinanceReportStatusEnum, MonthlyFinanceReportTypeEnum } from '@pif/shared';
import { StorageService } from '@pif/storage';
import { Logger } from 'nestjs-pino';
import { createHash } from 'node:crypto';
import { FINANCE_EXCEL_PUBLIC_REPORT_FOLDER } from '../../excel/excel-style.constants';
import { MonthlyExcelReportGenerator } from '../../excel/monthly-excel-report.generator';
import { GetMonthlyExcelReportDataQuery } from '../../queries/get-monthly-excel-report-data/get-monthly-excel-report-data.query';
import { MonthlyFinanceReportsRepository } from '../../repositories/monthly-finance-reports.repository';
import {
	GenerateMonthlyFinanceReportCommand,
	IGenerateMonthlyFinanceReportCommandResult
} from './generate-monthly-finance-report.command';

@Injectable()
@CommandHandler(GenerateMonthlyFinanceReportCommand)
export class GenerateMonthlyFinanceReportHandler implements ICommandHandler<GenerateMonthlyFinanceReportCommand> {
	constructor(
		private readonly queryBus: QueryBus,
		private readonly storage: StorageService,
		private readonly reportGenerator: MonthlyExcelReportGenerator,
		private readonly repository: MonthlyFinanceReportsRepository,
		private readonly config: ConfigService,
		private readonly logger: Logger
	) {}

	async execute({
		year,
		month,
		forceRegenerate
	}: GenerateMonthlyFinanceReportCommand): Promise<IGenerateMonthlyFinanceReportCommandResult> {
		const existing = await this.repository.findByPeriod(year, month, MonthlyFinanceReportTypeEnum.PUBLIC_XLSX);
		if (
			existing &&
			existing.status === MonthlyFinanceReportStatusEnum.SUCCEEDED &&
			existing.storageKey &&
			!forceRegenerate
		) {
			this.logger.log('Ежемесячный XLSX отчет уже существует, используем готовый', {
				reportId: existing.id,
				year,
				month,
				storageKey: existing.storageKey
			});
			return { id: existing.id, storageKey: existing.storageKey, reused: true };
		}

		const pending = await this.repository.upsertPending({
			year,
			month,
			reportType: MonthlyFinanceReportTypeEnum.PUBLIC_XLSX
		});

		try {
			const data = await this.queryBus.execute(new GetMonthlyExcelReportDataQuery(year, month));
			const appBaseUrl = this.config.getOrThrow<string>('APP_BASE_URL');
			const receiptRedirectBaseUrl = `${appBaseUrl}/finance/public/monthly-ledger/receipts`;
			const fileBuffer = await this.reportGenerator.generate({
				data,
				receiptRedirectBaseUrl
			});
			const checksumSha256 = createHash('sha256').update(fileBuffer).digest('hex');
			const storageKey = `${FINANCE_EXCEL_PUBLIC_REPORT_FOLDER}/${year}-${String(month).padStart(2, '0')}.xlsx`;

			await this.storage.uploadBuffer(storageKey, this.reportGenerator.getContentType(), fileBuffer);
			const saved = await this.repository.markSucceeded({
				id: pending.id,
				storageKey,
				checksumSha256,
				generatedAt: new Date()
			});

			if (!saved) {
				throw new InternalServerErrorException('Не удалось сохранить статус сформированного отчета');
			}

			this.logger.log('Ежемесячный XLSX отчет сгенерирован и опубликован', {
				reportId: saved.id,
				year,
				month,
				storageKey
			});
			return { id: saved.id, storageKey: saved.storageKey ?? null, reused: false };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			await this.repository.markFailed({
				id: pending.id,
				errorMessage
			});
			this.logger.error('Ошибка генерации ежемесячного XLSX отчета', {
				err: errorMessage,
				reportId: pending.id,
				year,
				month
			});
			throw error;
		}
	}
}
