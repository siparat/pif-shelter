import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { inviteEmail } from '@pif/email-templates';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { AppUrlMapper } from '../../../../core/mappers/app-url.mapper';
import { InvitationCreatedEvent } from './invitation-created.event';

@EventsHandler(InvitationCreatedEvent)
export class SendInvitationEmailHandler implements IEventHandler<InvitationCreatedEvent> {
	constructor(
		private readonly mailerService: MailerService,
		private readonly logger: Logger,
		private readonly config: ConfigService
	) {}

	async handle(event: InvitationCreatedEvent): Promise<void> {
		const { invitation } = event;
		try {
			const baseUrl = this.config.getOrThrow<string>('APP_BASE_URL');
			const inviteLink = AppUrlMapper.getInviteUrl(baseUrl, invitation.token);

			const html = await render(
				inviteEmail.component({
					name: invitation.personName,
					inviteLink,
					roleName: invitation.roleName
				})
			);

			await this.mailerService.sendMail({
				to: invitation.email,
				subject: inviteEmail.subject,
				html
			});

			this.logger.log('Письмо с приглашением успешно отправлено', {
				email: invitation.email,
				invitationId: invitation.id
			});
		} catch (error) {
			this.logger.error(
				{
					err: error instanceof Error ? error.message : error,
					email: invitation.email,
					invitationId: invitation.id
				},
				'Ошибка при отправке письма с приглашением'
			);
		}
	}
}
