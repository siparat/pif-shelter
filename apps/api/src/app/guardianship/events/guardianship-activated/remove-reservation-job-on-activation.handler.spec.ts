import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { GuardianshipQueueJobs, GUARDIANSHIP_QUEUE_NAME, GuardianshipStatusEnum } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { GuardianshipActivatedEvent } from './guardianship-activated.event';
import { RemoveReservationJobOnActivationHandler } from './remove-reservation-job-on-activation.handler';

describe('RemoveReservationJobOnActivationHandler', () => {
	let handler: RemoveReservationJobOnActivationHandler;
	let queue: DeepMocked<Queue>;
	let logger: DeepMocked<Logger>;

	const guardianshipId = faker.string.uuid();
	const mockGuardianship = {
		id: guardianshipId,
		animalId: faker.string.uuid(),
		guardianUserId: faker.string.uuid(),
		subscriptionId: faker.string.uuid(),
		status: GuardianshipStatusEnum.ACTIVE,
		startedAt: new Date(),
		cancelledAt: null as Date | null,
		cancellationToken: null as string | null
	};

	const mockJob = { remove: jest.fn().mockResolvedValue(undefined) };

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RemoveReservationJobOnActivationHandler,
				{
					provide: getQueueToken(GUARDIANSHIP_QUEUE_NAME),
					useValue: createMock<Queue>({
						getJob: jest.fn().mockResolvedValue(mockJob)
					})
				},
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<RemoveReservationJobOnActivationHandler>(RemoveReservationJobOnActivationHandler);
		queue = module.get(getQueueToken(GUARDIANSHIP_QUEUE_NAME));
		logger = module.get(Logger);
		jest.mocked(mockJob.remove).mockClear();
	});

	it('removes job by jobId when handle is called', async () => {
		await handler.handle(new GuardianshipActivatedEvent(mockGuardianship as never));

		const expectedJobId = `${GuardianshipQueueJobs.REMOVE_FROM_RESERVATION}:${guardianshipId}`;
		expect(queue.getJob).toHaveBeenCalledWith(expectedJobId);
		expect(mockJob.remove).toHaveBeenCalled();
	});

	it('logs debug when remove throws (job not found, idempotent)', async () => {
		jest.mocked(mockJob.remove).mockRejectedValueOnce(new Error('Job not found'));

		await handler.handle(new GuardianshipActivatedEvent(mockGuardianship as never));

		expect(logger.debug).toHaveBeenCalledWith('Задача бронирования уже удалена или не найдена', {
			guardianshipId,
			jobId: `${GuardianshipQueueJobs.REMOVE_FROM_RESERVATION}:${guardianshipId}`
		});
	});

	it('does not call remove when job is not found (getJob returns null)', async () => {
		(queue.getJob as jest.Mock).mockResolvedValueOnce(null);

		await handler.handle(new GuardianshipActivatedEvent(mockGuardianship as never));

		expect(mockJob.remove).not.toHaveBeenCalled();
	});
});
