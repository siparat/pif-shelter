import { MailerService } from '@nestjs-modules/mailer';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { guardianshipTelegramReminderEmail } from '@pif/email-templates';
import {
	GUARDIAN_PENDING_PAYMENT_EXPIRE_MS,
	GUARDIANSHIP_QUEUE_JOBS,
	GUARDIANSHIP_QUEUE_NAME,
	GuardianshipStatusEnum
} from '@pif/shared';
import { render } from '@react-email/render';
import { Job } from 'bullmq';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Logger } from 'nestjs-pino';
import { TelegramUrlMapper } from '../core/mappers/telegram-url.mapper';
import { GuardianshipCancelledEvent } from './events/guardianship-cancelled/guardianship-cancelled.event';
import { RemoveFromReservationJob } from './jobs/remove-from-reservation.job';
import { TelegramReminderJob } from './jobs/telegram-reminder.job';
import { GuardianshipRepository } from './repositories/guardianship.repository';

dayjs.extend(duration);

@Processor(GUARDIANSHIP_QUEUE_NAME)
export class GuardianshipProcessor extends WorkerHost {
	constructor(
		private readonly logger: Logger,
		private readonly repository: GuardianshipRepository,
		private readonly eventBus: EventBus,
		private readonly db: DatabaseService,
		private readonly mailerService: MailerService,
		private readonly config: ConfigService
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		switch (job.name) {
			case GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION:
				return this.removeFromReservation(job);
			case GUARDIANSHIP_QUEUE_JOBS.TELEGRAM_REMINDER:
				return this.sendTelegramReminder(job);
			default:
				this.logger.error('Неизвестная задача', { job, queueName: GUARDIANSHIP_QUEUE_NAME });
				return;
		}
	}

	private async removeFromReservation({
		data: { guardianshipId },
		id: jobId
	}: Job<RemoveFromReservationJob>): Promise<void> {
		const guardianship = await this.repository.findById(guardianshipId);
		if (!guardianship) {
			this.logger.error('Опекунство не найдено при удалении из бронирования', { guardianshipId, jobId });
			return;
		}
		if (guardianship.status !== GuardianshipStatusEnum.PENDING_PAYMENT) {
			this.logger.log('Опекунство не ожидает оплаты при удалении из бронирования', { guardianshipId, jobId });
			return;
		}
		await this.repository.cancel(guardianship.id, new Date());
		const minutes = Math.floor(dayjs.duration(GUARDIAN_PENDING_PAYMENT_EXPIRE_MS).asMinutes());
		this.eventBus.publish(
			new GuardianshipCancelledEvent(guardianship, `Оплата не поступила в течение ${minutes} минут`)
		);
		this.logger.log('Опекунство отменено из бронирования', { guardianshipId, jobId });
	}

	private async sendTelegramReminder({
		data: { guardianshipId },
		id: jobId
	}: Job<TelegramReminderJob>): Promise<void> {
		const result = await this.db.client.query.guardianships.findFirst({
			where: { id: guardianshipId },
			with: { guardian: true, animal: true }
		});

		if (!result?.guardian?.email || !result.animal?.name) {
			this.logger.debug('Пропуск напоминания о боте: опекунство или опекун не найдены', {
				guardianshipId,
				jobId
			});
			return;
		}

		if (result.guardian.telegramChatId != null) {
			this.logger.debug('Пропуск напоминания о боте: опекун уже привязал Telegram', {
				guardianshipId,
				jobId
			});
			return;
		}

		if (result.telegramReminderSentAt != null) {
			this.logger.debug('Пропуск напоминания о боте: напоминание уже отправлялось', {
				guardianshipId,
				jobId
			});
			return;
		}

		const token = result.guardian.telegramBotLinkToken;
		if (token == null) {
			this.logger.warn('Нет токена для ссылки на бота при отправке напоминания', {
				guardianshipId,
				jobId
			});
			return;
		}

		try {
			const botUsername = this.config.getOrThrow<string>('TELEGRAM_BOT_USERNAME');
			const telegramBotLink = TelegramUrlMapper.getTelegramBotLink(botUsername, token);

			const html = await render(
				guardianshipTelegramReminderEmail.component({
					guardianName: result.guardian.name,
					animalName: result.animal.name,
					telegramBotLink
				})
			);

			await this.mailerService.sendMail({
				to: result.guardian.email,
				subject: guardianshipTelegramReminderEmail.subject({
					guardianName: result.guardian.name,
					animalName: result.animal.name,
					telegramBotLink
				}),
				html
			});

			await this.repository.setTelegramReminderSentAt(guardianshipId, new Date());

			this.logger.log('Напоминание о привязке Telegram отправлено', {
				guardianshipId,
				email: result.guardian.email,
				jobId
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке напоминания о привязке Telegram', {
				err: error instanceof Error ? error.message : error,
				guardianshipId,
				jobId
			});
		}
	}
}
