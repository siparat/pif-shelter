import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { render } from '@react-email/render';
import { DonationSubscriptionInitiatedEvent } from './donation-subscription-initiated.event';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { donationSubscriptionCancelLinkEmail } from '@pif/email-templates';
import { AppUrlMapper } from '../../../core/mappers/app-url.mapper';

@EventsHandler(DonationSubscriptionInitiatedEvent)
export class SendDonationSubscriptionCancelLinkEmailHandler
	implements IEventHandler<DonationSubscriptionInitiatedEvent>
{
	constructor(
		private readonly repository: DonationIntentsRepository,
		private readonly mailerService: MailerService,
		private readonly config: ConfigService,
		private readonly logger: Logger
	) {}

	async handle({ subscription, email }: DonationSubscriptionInitiatedEvent): Promise<void> {
		if (!email) {
			this.logger.debug('Пропуск отправки письма со ссылкой отмены донат-подписки', {
				subscriptionId: subscription.subscriptionId
			});
			return;
		}

		const current = await this.repository.findSubscriptionBySubscriptionId(subscription.subscriptionId);
		if (!current || current.cancellationToken != null) {
			this.logger.debug('Пропуск отправки письма со ссылкой отмены донат-подписки', {
				subscriptionId: subscription.subscriptionId
			});
			return;
		}

		const cancellationToken = randomUUID();
		try {
			await this.repository.setSubscriptionCancellationToken(current.id, cancellationToken);

			const baseUrl = this.config.getOrThrow<string>('APP_BASE_URL');
			const cancelLink = AppUrlMapper.getCancelDonationSubscriptionUrl(baseUrl, cancellationToken);

			const html = await render(
				donationSubscriptionCancelLinkEmail.component({
					subscriptionId: current.subscriptionId,
					cancelLink
				})
			);

			await this.mailerService.sendMail({
				to: email,
				subject: donationSubscriptionCancelLinkEmail.subject,
				html
			});

			this.logger.log('Ссылка для отмены донат-подписки отправлена', {
				subscriptionId: current.subscriptionId,
				email
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма со ссылкой отмены донат-подписки', {
				err: error instanceof Error ? error.message : error,
				subscriptionId: current.subscriptionId,
				email
			});
		}
	}
}
