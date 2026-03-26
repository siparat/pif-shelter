import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { FINANCE_REPORTS_QUEUE_NAME, FinanceReportsQueueJobs } from '@pif/shared';
import { Job } from 'bullmq';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Logger } from 'nestjs-pino';
import { GenerateMonthlyFinanceReportCommand } from './commands/generate-monthly-finance-report/generate-monthly-finance-report.command';
import { GenerateMonthlyPublicXlsxReportJob } from './jobs/generate-monthly-public-xlsx-report.job';

dayjs.extend(utc);

@Processor(FINANCE_REPORTS_QUEUE_NAME)
export class FinanceReportsProcessor extends WorkerHost {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly logger: Logger
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		switch (job.name) {
			case FinanceReportsQueueJobs.GENERATE_MONTHLY_PUBLIC_XLSX:
				await this.processMonthlyXlsxJob(job as Job<GenerateMonthlyPublicXlsxReportJob>);
				return;
			default:
				this.logger.error('Неизвестная задача finance reports queue', {
					jobName: job.name,
					queueName: FINANCE_REPORTS_QUEUE_NAME
				});
		}
	}

	private async processMonthlyXlsxJob({
		data: { year, month },
		id: jobId
	}: Job<GenerateMonthlyPublicXlsxReportJob>): Promise<void> {
		const [actualYear, actualMonth] = year && month ? [year, month] : this.getPreviousMonth();
		await this.commandBus.execute(new GenerateMonthlyFinanceReportCommand(actualYear, actualMonth, false));
		this.logger.log('Фоновая генерация XLSX отчета выполнена', { year: actualYear, month: actualMonth, jobId });
	}

	private getPreviousMonth(): [number, number] {
		const previousMonth = dayjs.utc().subtract(1, 'month');
		return [previousMonth.year(), previousMonth.month() + 1];
	}
}
