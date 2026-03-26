import { InjectQueue } from '@nestjs/bullmq';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GUARDIANSHIP_QUEUE_NAME, GUARDIAN_TELEGRAM_REMINDER_DELAY_MS, GuardianshipQueueJobs } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { TelegramReminderJob } from '../../jobs/telegram-reminder.job';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';

@EventsHandler(GuardianshipActivatedEvent)
export class ScheduleTelegramReminderHandler implements IEventHandler<GuardianshipActivatedEvent> {
	constructor(
		private readonly logger: Logger,
		@InjectQueue(GUARDIANSHIP_QUEUE_NAME) private readonly queue: Queue<TelegramReminderJob>
	) {}

	async handle({ guardianship }: GuardianshipActivatedEvent): Promise<void> {
		const name = GuardianshipQueueJobs.TELEGRAM_REMINDER;
		const jobId = `${name}:${guardianship.id}`;
		await this.queue.add(
			name,
			{ guardianshipId: guardianship.id },
			{
				jobId,
				delay: GUARDIAN_TELEGRAM_REMINDER_DELAY_MS
			}
		);
		this.logger.log('Задача напоминания о привязке Telegram добавлена', {
			guardianshipId: guardianship.id,
			jobId
		});
	}
}
