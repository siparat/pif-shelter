import { InjectQueue } from '@nestjs/bullmq';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GUARDIANSHIP_QUEUE_JOBS, GUARDIANSHIP_QUEUE_NAME } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';

@EventsHandler(GuardianshipActivatedEvent)
export class RemoveReservationJobOnActivationHandler implements IEventHandler<GuardianshipActivatedEvent> {
	constructor(
		private readonly logger: Logger,
		@InjectQueue(GUARDIANSHIP_QUEUE_NAME) private readonly queue: Queue
	) {}

	async handle({ guardianshipId }: GuardianshipActivatedEvent): Promise<void> {
		const jobId = `${GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION}:${guardianshipId}`;
		try {
			await this.queue.remove(jobId);
		} catch {
			this.logger.debug('Задача бронирования уже удалена или не найдена', { guardianshipId, jobId });
		}
	}
}
