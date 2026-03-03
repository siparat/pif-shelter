import { MailerService } from '@nestjs-modules/mailer';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { guardianRegisteredEmail } from '@pif/email-templates';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { GuardianRegisteredEvent } from './guardian-registered.event';

@EventsHandler(GuardianRegisteredEvent)
export class GuardianRegisteredHandler implements IEventHandler<GuardianRegisteredEvent> {
	constructor(
		private mailerService: MailerService,
		private logger: Logger
	) {}

	async handle({ user, password }: GuardianRegisteredEvent): Promise<void> {
		try {
			const html = await render(
				guardianRegisteredEmail.component({
					password,
					email: user.email,
					guardianName: user.name,
					telegram: user.telegram
				})
			);

			await this.mailerService.sendMail({
				to: user.email,
				subject: guardianRegisteredEmail.subject,
				html
			});

			this.logger.log('Письмо c данными для входа опекуна отправлены', {
				userId: user.id,
				email: user.email
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма c данными для входа опекуна', {
				err: error instanceof Error ? error.message : error,
				userId: user.id,
				email: user.email
			});
		}
	}
}
