import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { guardianshipCancelLinkEmail } from '@pif/email-templates';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { AppUrlMapper } from '../../../core/mappers/app-url.mapper';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';

@EventsHandler(GuardianshipActivatedEvent)
export class SendGuardianshipCancelLinkEmailHandler implements IEventHandler<GuardianshipActivatedEvent> {
	constructor(
		private readonly db: DatabaseService,
		private readonly mailerService: MailerService,
		private readonly config: ConfigService,
		private readonly logger: Logger
	) {}

	async handle(event: GuardianshipActivatedEvent): Promise<void> {
		const result = await this.db.client.query.guardianships.findFirst({
			where: { id: event.guardianshipId },
			with: { guardian: true, animal: true }
		});

		if (!result?.guardian?.email || !result.animal?.name || result.cancellationToken == null) {
			this.logger.debug('Пропуск отправки письма со ссылкой отмены: нет данных или токен уже использован', {
				guardianshipId: event.guardianshipId
			});
			return;
		}

		try {
			const baseUrl = this.config.getOrThrow<string>('APP_BASE_URL');
			const cancelLink = AppUrlMapper.getCancelGuardianshipUrl(baseUrl, result.cancellationToken);

			const html = await render(
				guardianshipCancelLinkEmail.component({
					guardianName: result.guardian.name,
					animalName: result.animal.name,
					cancelLink
				})
			);

			await this.mailerService.sendMail({
				to: result.guardian.email,
				subject: guardianshipCancelLinkEmail.subject,
				html
			});

			this.logger.log('Письмо со ссылкой отмены опекунства отправлено', {
				guardianshipId: event.guardianshipId,
				email: result.guardian.email
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма со ссылкой отмены опекунства', {
				err: error instanceof Error ? error.message : error,
				guardianshipId: event.guardianshipId,
				email: result.guardian.email
			});
		}
	}
}
