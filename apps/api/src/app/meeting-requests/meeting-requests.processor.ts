import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { DatabaseService } from '@pif/database';
import { MEETING_QUEUE_NAME, MeetingQueueJobs, MeetingRequestStatusEnum } from '@pif/shared';
import { Job } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { TelegramBotService } from '../telegram-bot/telegram-bot.service';
import { SendMeetingReminderJob } from './jobs/send-meeting-reminder.job';

@Processor(MEETING_QUEUE_NAME)
export class MeetingRequestsProcessor extends WorkerHost {
	constructor(
		private readonly logger: Logger,
		private readonly db: DatabaseService,
		private readonly mailerService: MailerService,
		private readonly telegramService: TelegramBotService
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		switch (job.name) {
			case MeetingQueueJobs.SEND_REMINDER:
				return this.sendReminder(job as Job<SendMeetingReminderJob>);
			default:
				this.logger.error('Неизвестная задача', { jobName: job.name, queueName: MEETING_QUEUE_NAME });
				return;
		}
	}

	private async sendReminder({ data: { meetingRequestId }, id: jobId }: Job<SendMeetingReminderJob>): Promise<void> {
		const row = await this.db.client.query.meetingRequests.findFirst({
			where: { id: meetingRequestId },
			with: {
				animal: { columns: { id: true, name: true } },
				curator: { columns: { id: true, name: true, email: true, telegramChatId: true } }
			}
		});

		if (!row) {
			this.logger.warn('Заявка для напоминания не найдена', { meetingRequestId, jobId });
			return;
		}
		if (row.status !== MeetingRequestStatusEnum.CONFIRMED) {
			this.logger.log('Напоминание пропущено, заявка уже не подтверждена', {
				meetingRequestId,
				status: row.status,
				jobId
			});
			return;
		}
		if (!row.animal || !row.curator) {
			this.logger.warn('Напоминание пропущено: отсутствуют animal/curator', { meetingRequestId, jobId });
			return;
		}

		const meetingAt = row.meetingAt.toLocaleString('ru-RU');
		const animalName = row.animal.name;
		const applicantMessage = `Напоминание о встрече с ${animalName}. Встреча назначена на ${meetingAt}.`;
		const curatorMessage = `Напоминание: у вас встреча по заявке с ${row.name} (${row.phone}) на ${meetingAt} (${animalName}).`;

		const tasks: Promise<unknown>[] = [];
		if (row.email) {
			tasks.push(
				this.mailerService.sendMail({
					to: row.email,
					subject: `Напоминание о встрече с ${animalName}`,
					html: `<p>${applicantMessage}</p>`
				})
			);
		}
		if (row.curator.telegramChatId) {
			tasks.push(this.telegramService.sendMessage(row.curator.telegramChatId, curatorMessage));
		} else {
			tasks.push(
				this.mailerService.sendMail({
					to: row.curator.email,
					subject: `Напоминание о встрече с ${animalName}`,
					html: `<p>${curatorMessage}</p>`
				})
			);
		}

		if (tasks.length === 0) {
			this.logger.log('Напоминание пропущено: нет email получателей', { meetingRequestId, jobId });
			return;
		}

		await Promise.all(tasks);
		this.logger.log('Напоминание о встрече отправлено', { meetingRequestId, jobId });
	}
}
