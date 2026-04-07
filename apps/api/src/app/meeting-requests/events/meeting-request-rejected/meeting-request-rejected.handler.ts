import { MailerService } from '@nestjs-modules/mailer';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DatabaseService } from '@pif/database';
import { Logger } from 'nestjs-pino';
import { MeetingRequestRejectedEvent } from './meeting-request-rejected.event';

@EventsHandler(MeetingRequestRejectedEvent)
export class MeetingRequestRejectedHandler implements IEventHandler<MeetingRequestRejectedEvent> {
	constructor(
		private readonly mailerService: MailerService,
		private readonly db: DatabaseService,
		private readonly logger: Logger
	) {}

	async handle(event: MeetingRequestRejectedEvent): Promise<void> {
		const animal = await this.db.client.query.animals.findFirst({
			where: { id: event.meetingRequest.animalId }
		});
		if (!animal) {
			this.logger.error('Животное не найдено', { animalId: event.meetingRequest.animalId });
			return;
		}
		if (!event.meetingRequest.email) {
			this.logger.error('Email не найден', { meetingRequestId: event.meetingRequest.id });
			return;
		}
		try {
			await this.mailerService.sendMail({
				to: event.meetingRequest.email,
				subject: `Вам отказано в встрече с ${animal.name}`,
				html: `<p>Вам отказано в встрече с ${animal.name} по причине: <b>${event.meetingRequest.rejectionReason}</b></p>`
			});
		} catch (error) {
			this.logger.error('Ошибка при отправке письма об отказе в встрече', {
				error,
				meetingRequestId: event.meetingRequest.id
			});
			return;
		}
		this.logger.log('Письмо об отказе в встрече отправлено', { meetingRequestId: event.meetingRequest.id });
	}
}
