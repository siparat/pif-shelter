import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDIANSHIP_QUEUE_JOBS, GUARDIANSHIP_QUEUE_NAME } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';
import { RemoveReservationJobOnActivationHandler } from './remove-reservation-job-on-activation.handler';

describe('RemoveReservationJobOnActivationHandler', () => {
	let handler: RemoveReservationJobOnActivationHandler;
	let queue: DeepMocked<Queue>;
	let logger: DeepMocked<Logger>;

	const guardianshipId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RemoveReservationJobOnActivationHandler,
				{
					provide: getQueueToken(GUARDIANSHIP_QUEUE_NAME),
					useValue: createMock<Queue>({ remove: jest.fn().mockResolvedValue(undefined) })
				},
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<RemoveReservationJobOnActivationHandler>(RemoveReservationJobOnActivationHandler);
		queue = module.get(getQueueToken(GUARDIANSHIP_QUEUE_NAME));
		logger = module.get(Logger);
	});

	it('removes job by jobId when handle is called', async () => {
		await handler.handle(new GuardianshipActivatedEvent(guardianshipId));

		const expectedJobId = `${GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION}:${guardianshipId}`;
		expect(queue.remove).toHaveBeenCalledWith(expectedJobId);
	});

	it('logs debug when remove throws (job not found, idempotent)', async () => {
		(queue.remove as jest.Mock).mockRejectedValueOnce(new Error('Job not found'));

		await handler.handle(new GuardianshipActivatedEvent(guardianshipId));

		expect(logger.debug).toHaveBeenCalledWith('Задача бронирования уже удалена или не найдена', {
			guardianshipId,
			jobId: `${GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION}:${guardianshipId}`
		});
	});
});
