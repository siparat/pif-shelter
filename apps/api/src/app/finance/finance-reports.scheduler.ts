import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { FINANCE_REPORTS_QUEUE_NAME, FinanceReportsQueueJobs } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { GenerateMonthlyPublicXlsxReportJob } from './jobs/generate-monthly-public-xlsx-report.job';

@Injectable()
export class FinanceReportsScheduler implements OnModuleInit {
	constructor(
		@InjectQueue(FINANCE_REPORTS_QUEUE_NAME) private readonly queue: Queue<GenerateMonthlyPublicXlsxReportJob>,
		private readonly logger: Logger
	) {}

	async onModuleInit(): Promise<void> {
		const name = FinanceReportsQueueJobs.GENERATE_MONTHLY_PUBLIC_XLSX;
		const jobId = `${name}:repeat`;
		await this.queue.add(
			name,
			{},
			{
				jobId,
				repeat: {
					pattern: '0 0 1 * *',
					tz: 'UTC'
				}
			}
		);
		this.logger.log('Repeat-job генерации месячного XLSX зарегистрирован', { jobId });
	}
}
