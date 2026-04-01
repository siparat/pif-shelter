import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CacheService } from '@pif/cache';
import { CAMPAIGNS_QUEUE_NAME, CampaignsCacheKeys, CampaignsQueueJobs } from '@pif/shared';
import { Job } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { CampaignsService } from './campaigns.service';

@Processor(CAMPAIGNS_QUEUE_NAME)
export class CampaignsProcessor extends WorkerHost {
	constructor(
		private readonly campaignsService: CampaignsService,
		private readonly cache: CacheService,
		private readonly logger: Logger
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		switch (job.name) {
			case CampaignsQueueJobs.MARK_EXPIRED_AS_FAILED:
				await this.markExpiredAsFailed(job as Job);
				return;
			default:
				this.logger.error('Неизвестная задача campaigns queue', {
					jobName: job.name,
					queueName: CAMPAIGNS_QUEUE_NAME
				});
		}
	}

	private async markExpiredAsFailed({ id: jobId }: Job): Promise<void> {
		const ids = await this.campaignsService.markExpiredAsFailed(new Date());
		if (ids.length > 0) {
			await Promise.all(ids.map((id) => this.cache.del(CampaignsCacheKeys.detail(id))));
		}
		this.logger.log('Обработано закрытие просроченных сборов', { updatedCount: ids.length, jobId });
	}
}
