import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BLACKLIST_QUEUE_NAME, BlacklistQueueJobs } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';

@Injectable()
export class BlacklistScheduler implements OnModuleInit {
	constructor(
		@InjectQueue(BLACKLIST_QUEUE_NAME) private readonly queue: Queue,
		private readonly logger: Logger
	) {}

	onModuleInit(): void {
		const jobId = BlacklistQueueJobs.EXPIRATION_OF_SUSPICION + ':repeat';
		this.queue.add(
			BlacklistQueueJobs.EXPIRATION_OF_SUSPICION,
			{},
			{
				jobId,
				repeat: {
					pattern: '*/5 * * * *',
					tz: 'UTC'
				}
			}
		);
		this.logger.log('Repeat-job обработки истекших подозреваемых контактов', {
			jobId
		});
	}
}
