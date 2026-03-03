import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { Logger } from 'nestjs-pino';
import { AnimalNotFoundException } from '../../../animals/exceptions/animal-not-found.exception';
import { AnimalAlreadyHasGuardianException } from '../../exceptions/animal-already-has-guardian.exception';
import { AnimalCostOfGuardianshipNotSetException } from '../../exceptions/animal-cost-of-guardianship-not-set.exception';
import { GuardianshipCreatedEvent } from '../../events/guardianship-created/guardianship-created.event';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { StartGuardianshipCommand } from './start-guardianship.command';
import { StartGuardianshipHandler } from './start-guardianship.handler';
import { StartGuardianshipPolicy } from './start-guardianship.policy';

describe('StartGuardianshipHandler', () => {
	let handler: StartGuardianshipHandler;
	let policy: DeepMocked<StartGuardianshipPolicy>;
	let repository: DeepMocked<GuardianshipRepository>;
	let paymentService: DeepMocked<PaymentService>;
	let eventBus: DeepMocked<EventBus>;

	const userId = faker.string.uuid();
	const animalId = faker.string.uuid();

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				StartGuardianshipHandler,
				{ provide: StartGuardianshipPolicy, useValue: createMock<StartGuardianshipPolicy>() },
				{ provide: GuardianshipRepository, useValue: createMock<GuardianshipRepository>() },
				{ provide: PaymentService, useValue: createMock<PaymentService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<StartGuardianshipHandler>(StartGuardianshipHandler);
		policy = module.get(StartGuardianshipPolicy);
		repository = module.get(GuardianshipRepository);
		paymentService = module.get(PaymentService);
		eventBus = module.get(EventBus);
	});

	it('throws AnimalNotFoundException when policy throws', async () => {
		policy.assertCanStart.mockRejectedValue(new AnimalNotFoundException(animalId));

		await expect(handler.execute(new StartGuardianshipCommand(userId, animalId))).rejects.toThrow(
			AnimalNotFoundException
		);
		expect(repository.createPending).not.toHaveBeenCalled();
	});

	it('throws AnimalCostOfGuardianshipNotSetException when policy throws', async () => {
		policy.assertCanStart.mockRejectedValue(new AnimalCostOfGuardianshipNotSetException(animalId));

		await expect(handler.execute(new StartGuardianshipCommand(userId, animalId))).rejects.toThrow(
			AnimalCostOfGuardianshipNotSetException
		);
		expect(repository.createPending).not.toHaveBeenCalled();
	});

	it('throws AnimalAlreadyHasGuardianException when policy throws', async () => {
		policy.assertCanStart.mockRejectedValue(new AnimalAlreadyHasGuardianException());

		await expect(handler.execute(new StartGuardianshipCommand(userId, animalId))).rejects.toThrow(
			AnimalAlreadyHasGuardianException
		);
		expect(repository.createPending).not.toHaveBeenCalled();
	});

	it('creates guardianship with amount from policy and publishes GuardianshipCreatedEvent', async () => {
		const amount = 3200;
		policy.assertCanStart.mockResolvedValue({ id: animalId, costOfGuardianship: amount } as never);
		const created = { id: faker.string.uuid(), animalId, subscriptionId: faker.string.uuid() };
		repository.createPending.mockResolvedValue(created as never);
		paymentService.generatePaymentLink.mockResolvedValue({ url: 'https://pay.example/1', amount });

		const result = await handler.execute(new StartGuardianshipCommand(userId, animalId));

		expect(policy.assertCanStart).toHaveBeenCalledWith(animalId);
		expect(repository.createPending).toHaveBeenCalledWith(userId, animalId, expect.any(String));
		expect(paymentService.generatePaymentLink).toHaveBeenCalledWith('subscription', expect.any(String), amount);
		expect(eventBus.publish).toHaveBeenCalledWith(new GuardianshipCreatedEvent(animalId));
		expect(result).toEqual({ guardianshipId: created.id, paymentUrl: 'https://pay.example/1' });
	});
});
