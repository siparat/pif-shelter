import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { guardianshipActivatedEmail } from '@pif/email-templates';
import { randomUUID } from 'crypto';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { AppUrlMapper } from '../../../core/mappers/app-url.mapper';
import { UsersService } from '../../../users/users.service';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';

@EventsHandler(GuardianshipActivatedEvent)
export class SendGuardianshipActivatedEmailHandler implements IEventHandler<GuardianshipActivatedEvent> {
	constructor(
		private readonly db: DatabaseService,
		private readonly mailerService: MailerService,
		private readonly config: ConfigService,
		private readonly usersService: UsersService,
		private readonly logger: Logger
	) {}

	async handle({ guardianship }: GuardianshipActivatedEvent): Promise<void> {
		const result = await this.db.client.query.guardianships.findFirst({
			where: { id: guardianship.id },
			with: { guardian: true, animal: true }
		});

		if (!result?.guardian?.email || !result.animal?.name) {
			this.logger.debug('Пропуск отправки письма «вы оформили опекунство»: нет email или имени животного', {
				guardianshipId: guardianship.id
			});
			return;
		}

		try {
			let botLinkToken = result.guardian.telegramBotLinkToken;
			if (botLinkToken == null) {
				botLinkToken = randomUUID();
				await this.usersService.setTelegramBotLinkToken(result.guardian.id, botLinkToken);
			}
			const botUsername = this.config.getOrThrow<string>('TELEGRAM_BOT_USERNAME');
			const telegramBotLink = AppUrlMapper.getTelegramBotLink(botUsername, botLinkToken);

			const html = await render(
				guardianshipActivatedEmail.component({
					guardianName: result.guardian.name,
					animalName: result.animal.name,
					telegramBotLink
				})
			);

			await this.mailerService.sendMail({
				to: result.guardian.email,
				subject: guardianshipActivatedEmail.subject,
				html
			});

			this.logger.log('Письмо «вы оформили опекунство» отправлено', {
				guardianshipId: guardianship.id,
				email: result.guardian.email
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма «вы оформили опекунство»', {
				err: error instanceof Error ? error.message : error,
				guardianshipId: guardianship.id,
				email: result?.guardian?.email ?? 'unknown'
			});
		}
	}
}
