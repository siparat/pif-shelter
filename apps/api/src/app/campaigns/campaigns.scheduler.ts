import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CAMPAIGNS_QUEUE_NAME, CampaignsQueueJobs } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';

@Injectable()
export class CampaignsScheduler implements OnModuleInit {
	constructor(
		@InjectQueue(CAMPAIGNS_QUEUE_NAME) private readonly queue: Queue,
		private readonly logger: Logger
	) {}

	async onModuleInit(): Promise<void> {
		const name = CampaignsQueueJobs.MARK_EXPIRED_AS_FAILED;
		const jobId = `${name}:repeat`;
		await this.queue.add(
			name,
			{},
			{
				jobId,
				repeat: {
					pattern: '*/5 * * * *',
					tz: 'UTC'
				}
			}
		);
		this.logger.log('Repeat-job закрытия просроченных сборов зарегистрирован', { jobId });
	}
}
