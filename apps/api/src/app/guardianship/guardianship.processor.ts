import { Processor, WorkerHost } from '@nestjs/bullmq';
import { GUARDIANSHIP_QUEUE_JOBS, GUARDIANSHIP_QUEUE_NAME, GuardianshipStatusEnum } from '@pif/shared';
import { Job } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { EventBus } from '@nestjs/cqrs';
import { GuardianshipCancelledEvent } from './events/guardianship-cancelled/guardianship-cancelled.event';
import { RemoveFromReservationJob } from './jobs/remove-from-reservation.job';
import { GuardianshipRepository } from './repositories/guardianship.repository';

@Processor(GUARDIANSHIP_QUEUE_NAME)
export class GuardianshipProcessor extends WorkerHost {
	constructor(
		private readonly logger: Logger,
		private readonly repository: GuardianshipRepository,
		private readonly eventBus: EventBus
	) {
		super();
	}

	async process(job: Job): Promise<void> {
		switch (job.name) {
			case GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION:
				return this.removeFromReservation(job);
			default:
				this.logger.error('Неизвестная задача', { job, queueName: GUARDIANSHIP_QUEUE_NAME });
				return;
		}
	}

	private async removeFromReservation({
		data: { guardianshipId },
		id: jobId
	}: Job<RemoveFromReservationJob>): Promise<void> {
		const guardianship = await this.repository.findById(guardianshipId);
		if (!guardianship) {
			this.logger.error('Опекунство не найдено при удалении из бронирования', { guardianshipId, jobId });
			return;
		}
		if (guardianship.status !== GuardianshipStatusEnum.PENDING_PAYMENT) {
			this.logger.log('Опекунство не ожидает оплаты при удалении из бронирования', { guardianshipId, jobId });
			return;
		}
		await this.repository.cancel(guardianship.id, new Date());
		this.eventBus.publish(new GuardianshipCancelledEvent(guardianship, 'Оплата не поступила в течение 10 минут'));
		this.logger.log('Опекунство отменено из бронирования', { guardianshipId, jobId });
	}
}
