import { MailerService } from '@nestjs-modules/mailer';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { guardianshipCancelledEmail } from '@pif/email-templates';
import { GuardianshipStatusEnum } from '@pif/shared';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from './guardianship-cancelled.event';

@EventsHandler(GuardianshipCancelledEvent)
export class SendGuardianshipCancelledEmailHandler implements IEventHandler<GuardianshipCancelledEvent> {
	constructor(
		private readonly db: DatabaseService,
		private readonly mailerService: MailerService,
		private readonly logger: Logger
	) {}

	async handle(event: GuardianshipCancelledEvent): Promise<void> {
		if (!event.reason) {
			this.logger.debug('Пропуск отправки письма об отмене опекунства: нет причины', {
				guardianUserId: event.guardianship.guardianUserId
			});
			return;
		}
		if (event.guardianship.status !== GuardianshipStatusEnum.ACTIVE) {
			this.logger.debug('Пропуск отправки письма со ссылкой отмены: подписка не была ранее активна', {
				guardianUserId: event.guardianship.guardianUserId
			});
			return;
		}
		const guardianship = await this.db.client.query.guardianships.findFirst({
			where: { id: event.guardianship.id },
			with: { animal: true, guardian: true }
		});
		if (!guardianship || !guardianship.animal || !guardianship.guardian) {
			this.logger.debug('Пропуск отправки письма со ссылкой отмены: нет данных о пользователе', {
				guardianUserId: event.guardianship.guardianUserId
			});
			return;
		}

		try {
			const html = await render(
				guardianshipCancelledEmail.component({
					animalName: guardianship.animal.name,
					guardianName: guardianship.guardian.name,
					reason: event.reason
				})
			);

			await this.mailerService.sendMail({
				to: guardianship.guardian.email,
				subject: guardianshipCancelledEmail.subject,
				html
			});

			this.logger.log('Письмо об отмене опекунства отправлено', {
				guardianUserId: event.guardianship.guardianUserId,
				email: guardianship.guardian.email,
				reason: event.reason
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма об отмене опекунства', {
				err: error instanceof Error ? error.message : error,
				guardianUserId: event.guardianship.guardianUserId,
				email: guardianship.guardian.email,
				reason: event.reason
			});
		}
	}
}
