import { SharedBullAsyncConfiguration } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@pif/config';

export const getQueueConfig = (): SharedBullAsyncConfiguration => ({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => ({
		defaultJobOptions: {
			attempts: 3,
			backoff: { type: 'exponential', delay: 1000 },
			removeOnComplete: true,
			removeOnFail: { age: 1000 * 60 * 60 * 24 * 30, count: 1000 }
		},
		connection: {
			url: config.getOrThrow('QUEUE_REDIS_URL'),
			maxRetriesPerRequest: null
		}
	})
});
