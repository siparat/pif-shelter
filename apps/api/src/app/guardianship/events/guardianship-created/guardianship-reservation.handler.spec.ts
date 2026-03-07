import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARDIAN_PENDING_PAYMENT_EXPIRE_MS, GUARDIANSHIP_QUEUE_JOBS, GUARDIANSHIP_QUEUE_NAME } from '@pif/shared';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { GuardianshipCreatedEvent } from './guardianship-created.event';
import { GuardianshipReservationHandler } from './guardianship-reservation.handler';

describe('GuardianshipReservationHandler', () => {
	let handler: GuardianshipReservationHandler;
	let queue: DeepMocked<Queue>;
	let logger: DeepMocked<Logger>;

	const guardianshipId = faker.string.uuid();
	const animalId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GuardianshipReservationHandler,
				{
					provide: getQueueToken(GUARDIANSHIP_QUEUE_NAME),
					useValue: createMock<Queue>({ add: jest.fn().mockResolvedValue(undefined) })
				},
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<GuardianshipReservationHandler>(GuardianshipReservationHandler);
		queue = module.get(getQueueToken(GUARDIANSHIP_QUEUE_NAME));
		logger = module.get(Logger);
	});

	it('adds delayed job to queue with correct name, data, jobId and delay', async () => {
		await handler.handle(new GuardianshipCreatedEvent(animalId, guardianshipId));

		const expectedJobId = `${GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION}:${guardianshipId}`;
		expect(queue.add).toHaveBeenCalledWith(
			GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION,
			{ guardianshipId },
			{ jobId: expectedJobId, delay: GUARDIAN_PENDING_PAYMENT_EXPIRE_MS }
		);
	});

	it('logs that reservation job was added', async () => {
		await handler.handle(new GuardianshipCreatedEvent(animalId, guardianshipId));

		expect(logger.log).toHaveBeenCalledWith('Задача удаления из бронирования добавлена', {
			guardianshipId,
			jobId: `${GUARDIANSHIP_QUEUE_JOBS.REMOVE_FROM_RESERVATION}:${guardianshipId}`
		});
	});
});
