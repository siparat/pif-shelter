import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BLACKLIST_QUEUE_NAME, BlacklistQueueJobs } from '@pif/shared';
import { Job } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { BlacklistService } from './blacklist.service';

@Processor(BLACKLIST_QUEUE_NAME)
export class BlacklistProcessor extends WorkerHost {
	constructor(
		private readonly logger: Logger,
		private readonly blacklistService: BlacklistService
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		switch (job.name) {
			case BlacklistQueueJobs.EXPIRATION_OF_SUSPICION:
				await this.markSuspicionAsExpired(job);
				return;
			default:
				this.logger.error('Неизвестная задача blacklist queue', {
					jobName: job.name,
					queueName: BLACKLIST_QUEUE_NAME
				});
		}
	}

	private async markSuspicionAsExpired({ id: jobId }: Job): Promise<void> {
		const { count } = await this.blacklistService.markSuspicionAsExpired();
		this.logger.log('Обработаны истекшие подозрения', { updatedCount: count, jobId });
	}
}
