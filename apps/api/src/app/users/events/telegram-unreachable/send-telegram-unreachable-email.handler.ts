import { MailerService } from '@nestjs-modules/mailer';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { telegramUnreachableEmail } from '@pif/email-templates';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { UsersRepository } from '../../repositories/users.repository';
import { UserTelegramUnreachableEvent } from './telegram-unreachable.event';

@EventsHandler(UserTelegramUnreachableEvent)
export class SendTelegramUnreachableEmailHandler implements IEventHandler<UserTelegramUnreachableEvent> {
	constructor(
		private readonly repository: UsersRepository,
		private readonly mailerService: MailerService,
		private readonly logger: Logger
	) {}

	async handle(event: UserTelegramUnreachableEvent): Promise<void> {
		const user = await this.repository.findById(event.userId);
		if (!user?.email) {
			this.logger.debug('Пропуск письма о недоступности Telegram: пользователь не найден или нет email', {
				userId: event.userId
			});
			return;
		}

		try {
			const html = await render(
				telegramUnreachableEmail.component({
					userName: user.name
				})
			);

			await this.mailerService.sendMail({
				to: user.email,
				subject: telegramUnreachableEmail.subject,
				html
			});

			this.logger.log('Письмо о недоступности Telegram отправлено', {
				userId: event.userId,
				email: user.email
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма о недоступности Telegram', {
				err: error instanceof Error ? error.message : error,
				userId: event.userId,
				email: user.email
			});
		}
	}
}
