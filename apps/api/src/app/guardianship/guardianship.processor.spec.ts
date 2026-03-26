import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@pif/database';
import {
	GUARDIAN_PENDING_PAYMENT_EXPIRE_MS,
	GuardianshipQueueJobs,
	GUARDIANSHIP_QUEUE_NAME,
	GuardianshipStatusEnum
} from '@pif/shared';
import { Job } from 'bullmq';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from './events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipProcessor } from './guardianship.processor';
import { GuardianshipRepository } from './repositories/guardianship.repository';

dayjs.extend(duration);

describe('GuardianshipProcessor', () => {
	let processor: GuardianshipProcessor;
	let repository: DeepMocked<GuardianshipRepository>;
	let eventBus: DeepMocked<EventBus>;
	let logger: DeepMocked<Logger>;

	const guardianshipId = faker.string.uuid();
	const jobId = `${GuardianshipQueueJobs.REMOVE_FROM_RESERVATION}:${guardianshipId}`;
	const cancelledAt = new Date('2026-03-06T12:00:00.000Z');

	beforeEach(async () => {
		jest.useFakeTimers();
		jest.setSystemTime(cancelledAt);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GuardianshipProcessor,
				{ provide: GuardianshipRepository, useValue: createMock<GuardianshipRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() },
				{ provide: DatabaseService, useValue: createMock<DatabaseService>() },
				{ provide: MailerService, useValue: createMock<MailerService>() },
				{ provide: ConfigService, useValue: createMock<ConfigService>() }
			]
		}).compile();

		processor = module.get<GuardianshipProcessor>(GuardianshipProcessor);
		repository = module.get(GuardianshipRepository);
		eventBus = module.get(EventBus);
		logger = module.get(Logger);
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('logs error and returns when guardianship not found', async () => {
		repository.findById.mockResolvedValue(undefined);

		const job = {
			name: GuardianshipQueueJobs.REMOVE_FROM_RESERVATION,
			data: { guardianshipId },
			id: jobId
		} as Job;

		await processor.process(job);

		expect(logger.error).toHaveBeenCalledWith('Опекунство не найдено при удалении из бронирования', {
			guardianshipId,
			jobId
		});
		expect(repository.cancel).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('logs and returns when guardianship status is not PENDING_PAYMENT', async () => {
		const guardianship = {
			id: guardianshipId,
			status: GuardianshipStatusEnum.ACTIVE
		} as never;
		repository.findById.mockResolvedValue(guardianship);

		const job = {
			name: GuardianshipQueueJobs.REMOVE_FROM_RESERVATION,
			data: { guardianshipId },
			id: jobId
		} as Job;

		await processor.process(job);

		expect(logger.log).toHaveBeenCalledWith('Опекунство не ожидает оплаты при удалении из бронирования', {
			guardianshipId,
			jobId
		});
		expect(repository.cancel).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('cancels guardianship, publishes event and logs when status is PENDING_PAYMENT', async () => {
		const guardianship = {
			id: guardianshipId,
			status: GuardianshipStatusEnum.PENDING_PAYMENT,
			animalId: faker.string.uuid(),
			subscriptionId: faker.string.uuid()
		} as never;
		repository.findById.mockResolvedValue(guardianship);
		repository.cancel.mockResolvedValue(undefined);

		const job = {
			name: GuardianshipQueueJobs.REMOVE_FROM_RESERVATION,
			data: { guardianshipId },
			id: jobId
		} as Job;

		await processor.process(job);

		expect(repository.cancel).toHaveBeenCalledWith(guardianshipId, cancelledAt, null);
		const expectedReason = `Оплата не поступила в течение ${Math.floor(dayjs.duration(GUARDIAN_PENDING_PAYMENT_EXPIRE_MS).asMinutes())} минут`;
		expect(eventBus.publish).toHaveBeenCalledWith(
			new GuardianshipCancelledEvent(guardianship, false, expectedReason)
		);
		expect(logger.log).toHaveBeenCalledWith('Опекунство отменено из бронирования', { guardianshipId, jobId });
	});

	it('logs error for unknown job name', async () => {
		const job = { name: 'unknown-job', data: {}, id: 'x' } as Job;

		await processor.process(job);

		expect(logger.error).toHaveBeenCalledWith('Неизвестная задача', {
			job,
			queueName: GUARDIANSHIP_QUEUE_NAME
		});
		expect(repository.findById).not.toHaveBeenCalled();
	});
});
