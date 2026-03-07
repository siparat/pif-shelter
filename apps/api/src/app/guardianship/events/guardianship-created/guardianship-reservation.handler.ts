import { InjectQueue } from '@nestjs/bullmq';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { GUARDIAN_PENDING_PAYMENT_EXPIRE_MS, GUARDIANSHIP_QUEUE_JOBS, GUARDIANSHIP_QUEUE_NAME } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { RemoveFromReservationJob } from '../../jobs/remove-from-reservation.job';
import { GuardianshipCreatedEvent } from './guardianship-created.event';

@EventsHandler(GuardianshipCreatedEvent)
export class GuardianshipReservationHandler implements IEventHandler<GuardianshipCreatedEvent> {
	constructor(
		private readonly logger: Logger,
		@InjectQueue(GUARDIANSHIP_QUEUE_NAME) private readonly queue: Queue<RemoveFromReservationJob>
	) {}

	async handle({ guardianshipId }: GuardianshipCreatedEvent): Promise<void> {
		const name = GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION;
		const jobId = `${name}:${guardianshipId}`;
		this.queue.add(
			name,
			{ guardianshipId },
			{
				jobId,
				delay: GUARDIAN_PENDING_PAYMENT_EXPIRE_MS
			}
		);
		this.logger.log('Задача удаления из бронирования добавлена', { guardianshipId, jobId });
	}
}
