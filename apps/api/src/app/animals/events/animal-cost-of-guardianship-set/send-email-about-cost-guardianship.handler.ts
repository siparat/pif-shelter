import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { costOfGuardianshipChangedEmail, guardianshipRefundedEmail } from '@pif/email-templates';
import { PaymentService } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { render } from '@react-email/render';
import { Logger } from 'nestjs-pino';
import { AppUrlMapper } from '../../../core/mappers/app-url.mapper';
import { CancelGuardianshipCommand } from '../../../guardianship/commands/cancel-guardianship/cancel-guardianship.command';
import { AnimalCostOfGuardianshipSetEvent } from './animal-cost-of-guardianship-set.event';

@EventsHandler(AnimalCostOfGuardianshipSetEvent)
export class SendEmailAboutCostGuardianshipHandler implements IEventHandler<AnimalCostOfGuardianshipSetEvent> {
	constructor(
		private readonly mailerService: MailerService,
		private readonly logger: Logger,
		private readonly db: DatabaseService,
		private readonly paymentService: PaymentService,
		private readonly config: ConfigService,
		private readonly commandBus: CommandBus
	) {}

	async handle({ animalId, newCost, oldCost }: AnimalCostOfGuardianshipSetEvent): Promise<void> {
		const animal = await this.db.client.query.animals.findFirst({
			where: { id: animalId },
			with: { guardianship: { where: { status: GuardianshipStatusEnum.ACTIVE }, with: { guardian: true } } }
		});
		if (!animal) {
			this.logger.error('Животное не найдено', { animalId, newCost, oldCost });
			return;
		}
		if (!animal.guardianship || !animal.guardianship.guardian) {
			this.logger.log('Животное не имеет активного опекунства', { animalId, newCost, oldCost });
			return;
		}

		if (newCost === null) {
			await Promise.all([
				this.paymentService.refundSubscription(animal.guardianship.subscriptionId),
				this.commandBus.execute(new CancelGuardianshipCommand(animal.guardianship.id, true))
			]);
			try {
				const html = await render(
					guardianshipRefundedEmail.component({
						animalName: animal.name,
						guardianName: animal.guardianship.guardian.name
					})
				);
				await this.mailerService.sendMail({
					to: animal.guardianship.guardian.email,
					subject: guardianshipRefundedEmail.subject,
					html
				});
				this.logger.log('Письмо об отмене опекунства отправлено', {
					animalId,
					newCost,
					oldCost
				});
				return;
			} catch (error) {
				return this.logger.error('Ошибка при отправке письма об отмене опекунства', {
					error,
					animalId,
					newCost,
					oldCost
				});
			}
		}

		const baseUrl = this.config.get<string>('APP_BASE_URL') ?? '';
		await this.paymentService.changeCostSubscription(animal.guardianship.subscriptionId, newCost);
		try {
			const html = await render(
				costOfGuardianshipChangedEmail.component({
					animalName: animal.name,
					guardianName: animal.guardianship.guardian.name,
					oldCost: oldCost ?? 0,
					newCost,
					cancelLink: AppUrlMapper.getCancelGuardianshipUrl(
						baseUrl,
						animal.guardianship.cancellationToken ?? ''
					)
				})
			);
			await this.mailerService.sendMail({
				to: animal.guardianship.guardian.email,
				subject: costOfGuardianshipChangedEmail.subject,
				html
			});
			this.logger.log('Письмо об изменении стоимости опекунства отправлено', {
				animalId,
				newCost,
				oldCost
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма об изменении стоимости опекунства', {
				error,
				animalId,
				newCost,
				oldCost
			});
		}
	}
}
