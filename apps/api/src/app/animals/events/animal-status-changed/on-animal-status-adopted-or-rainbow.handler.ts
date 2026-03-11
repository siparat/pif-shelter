import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { animalAdoptedEmail, animalRainbowEmail } from '@pif/email-templates';
import { AnimalStatusEnum, GuardianshipStatusEnum } from '@pif/shared';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { AppUrlMapper } from '../../../core/mappers/app-url.mapper';
import { CancelGuardianshipCommand } from '../../../guardianship/commands/cancel-guardianship/cancel-guardianship.command';
import { AnimalStatusChangedEvent } from './animal-status-changed.event';
import { PaymentService } from '@pif/payment';

@EventsHandler(AnimalStatusChangedEvent)
export class OnAnimalStatusAdoptedOrRainbowHandler implements IEventHandler<AnimalStatusChangedEvent> {
	constructor(
		private readonly db: DatabaseService,
		private readonly commandBus: CommandBus,
		private readonly mailerService: MailerService,
		private readonly logger: Logger,
		private readonly config: ConfigService,
		private readonly paymentService: PaymentService
	) {}

	async handle(event: AnimalStatusChangedEvent): Promise<void> {
		const { animalId, newStatus, oldStatus } = event;
		if (newStatus !== AnimalStatusEnum.ADOPTED && newStatus !== AnimalStatusEnum.RAINBOW) {
			return;
		}

		const animal = await this.db.client.query.animals.findFirst({
			where: { id: animalId },
			with: {
				guardianship: {
					where: { status: GuardianshipStatusEnum.ACTIVE },
					with: { guardian: true }
				}
			}
		});

		if (!animal?.guardianship?.guardian) {
			this.logger.log('Нет активного опекунства для животного при смене статуса', {
				animalId,
				newStatus
			});
			return;
		}

		if (oldStatus === newStatus) {
			this.logger.debug('Пропуск отправки письма о смене статуса животного: статус не изменился', {
				animalId,
				newStatus
			});
			return;
		}

		const reason = newStatus === AnimalStatusEnum.ADOPTED ? 'Животное приютили 🎊' : 'Животное ушло на радугу 😞';
		await this.commandBus.execute(new CancelGuardianshipCommand(animal.guardianship.id, true, reason));
		await this.paymentService.refundSubscription(animal.guardianship.subscriptionId);

		const template = newStatus === AnimalStatusEnum.ADOPTED ? animalAdoptedEmail : animalRainbowEmail;

		const baseUrl = this.config.get<string>('APP_BASE_URL') ?? '';
		const props = {
			animalName: animal.name,
			guardianName: animal.guardianship.guardian.name,
			homeLink: AppUrlMapper.getHomeUrl(baseUrl)
		};
		const subject = template.subject(props);

		try {
			const html = await render(template.component(props));
			await this.mailerService.sendMail({
				to: animal.guardianship.guardian.email,
				subject,
				html
			});
			this.logger.log('Письмо о смене статуса животного отправлено опекуну', {
				animalId,
				newStatus,
				email: animal.guardianship.guardian.email
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма о смене статуса животного опекуну', {
				err: error instanceof Error ? error.message : error,
				animalId,
				newStatus,
				email: animal.guardianship.guardian.email
			});
		}
	}
}
