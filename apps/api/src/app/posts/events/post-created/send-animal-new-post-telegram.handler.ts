import { InjectQueue } from '@nestjs/bullmq';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { POSTS_QUEUE_NAME, PostsQueueJobs } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { TelegramNewPostJob } from '../../jobs/telegram-new-post.job';
import { PostCreatedEvent } from './post-created.event';

@EventsHandler(PostCreatedEvent)
export class SendAnimalNewPostTelegramHandler implements IEventHandler<PostCreatedEvent> {
	constructor(
		private readonly logger: Logger,
		@InjectQueue(POSTS_QUEUE_NAME) private readonly queue: Queue<TelegramNewPostJob>
	) {}

	async handle({ post }: PostCreatedEvent): Promise<void> {
		const name = PostsQueueJobs.TELEGRAM_NEW_POST;
		const jobId = `${name}:${post.id}`;

		await this.queue.add(
			name,
			{ post },
			{
				jobId
			}
		);

		this.logger.log('Telegram job о новом посте добавлен', { postId: post.id, jobId });
	}
}
