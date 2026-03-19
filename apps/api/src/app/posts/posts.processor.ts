import { Processor, WorkerHost } from '@nestjs/bullmq';
import { DatabaseService } from '@pif/database';
import { GuardianshipStatusEnum, POSTS_QUEUE_JOBS, POSTS_QUEUE_NAME } from '@pif/shared';
import { Job } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { TelegramNewPostJob } from './jobs/telegram-new-post.job';

@Processor(POSTS_QUEUE_NAME)
export class PostsProcessor extends WorkerHost {
	constructor(
		private readonly logger: Logger,
		private readonly db: DatabaseService,
		private readonly telegramBotService: TelegramBotService
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		const currentAttempt = job.attemptsMade + 1;
		const totalAttempts = job.opts.attempts ?? currentAttempt;

		try {
			switch (job.name) {
				case POSTS_QUEUE_JOBS.TELEGRAM_NEW_POST:
					return await this.sendTelegramNewPost(job);
				default:
					this.logger.error('Неизвестная задача', {
						queueName: job.queueName,
						jobName: job.name,
						jobId: job.id
					});
					return;
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			this.logger.error('Ошибка обработки job (BullMQ retry)', {
				queueName: job.queueName,
				jobName: job.name,
				jobId: job.id,
				postId: job.data.post.id,
				currentAttempt,
				totalAttempts,
				error: message
			});
			throw err;
		}
	}

	private async sendTelegramNewPost(job: Job<TelegramNewPostJob>): Promise<void> {
		const postId = job.data.post?.id ?? '';
		const jobId = job.id;

		const post = await this.db.client.query.posts.findFirst({
			where: { id: postId },
			with: { animal: true, media: true }
		});

		if (!postId || !post?.animal?.name) {
			this.logger.debug('Пропуск Telegram уведомления о новом посте: пост или животное не найдено', {
				postId,
				jobId
			});
			return;
		}

		const guardianship = await this.db.client.query.guardianships.findFirst({
			where: { animalId: post.animalId, status: GuardianshipStatusEnum.ACTIVE },
			with: { guardian: true }
		});

		const chatId = guardianship?.guardian?.telegramChatId;
		if (!guardianship || chatId == null) {
			this.logger.debug('Пропуск Telegram уведомления о новом посте: нет Telegram привязки', {
				postId,
				jobId
			});
			return;
		}

		await this.telegramBotService.sendAnimalNewPostMessage(Number(chatId), {
			postId,
			animalName: post.animal.name,
			postTitle: post.title,
			postBodyHtml: post.body,
			media: post.media,
			visibility: post.visibility
		});

		this.logger.log('Telegram уведомление о новом посте отправлено', {
			postId,
			guardianshipId: guardianship.id,
			jobId
		});
	}
}
