import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { Logger } from 'nestjs-pino';
import { GuardianshipStatusEnum } from '@pif/shared';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipNotFoundException } from '../../exceptions/guardianship-not-found.exception';
import { PaymentServiceUnavailableException } from '../../exceptions/payment-service-unavailable.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { CancelGuardianshipCommand } from './cancel-guardianship.command';
import { CancelGuardianshipHandler } from './cancel-guardianship.handler';
import { CancelGuardianshipPolicy } from './cancel-guardianship.policy';

describe('CancelGuardianshipHandler', () => {
	let handler: CancelGuardianshipHandler;
	let policy: DeepMocked<CancelGuardianshipPolicy>;
	let repository: DeepMocked<GuardianshipRepository>;
	let paymentService: DeepMocked<PaymentService>;
	let eventBus: DeepMocked<EventBus>;

	const guardianshipId = faker.string.uuid();
	const animalId = faker.string.uuid();
	const reason = 'Отмена по запросу администратора';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CancelGuardianshipHandler,
				{ provide: CancelGuardianshipPolicy, useValue: createMock<CancelGuardianshipPolicy>() },
				{ provide: GuardianshipRepository, useValue: createMock<GuardianshipRepository>() },
				{ provide: PaymentService, useValue: createMock<PaymentService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<CancelGuardianshipHandler>(CancelGuardianshipHandler);
		policy = module.get(CancelGuardianshipPolicy);
		repository = module.get(GuardianshipRepository);
		paymentService = module.get(PaymentService);
		eventBus = module.get(EventBus);
	});

	it('throws GuardianshipNotFoundException when policy throws', async () => {
		policy.assertCanCancel.mockRejectedValue(new GuardianshipNotFoundException());

		await expect(handler.execute(new CancelGuardianshipCommand(guardianshipId, reason))).rejects.toThrow(
			GuardianshipNotFoundException
		);
		expect(repository.cancel).not.toHaveBeenCalled();
	});

	it('returns idempotent success when isAlreadyTerminal', async () => {
		policy.assertCanCancel.mockResolvedValue({
			guardianship: {
				id: guardianshipId,
				animalId,
				status: GuardianshipStatusEnum.CANCELLED
			} as never,
			isAlreadyTerminal: true
		});

		const result = await handler.execute(new CancelGuardianshipCommand(guardianshipId, reason));

		expect(result).toEqual({ guardianshipId });
		expect(paymentService.cancelSubscription).not.toHaveBeenCalled();
		expect(repository.cancel).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws PaymentServiceUnavailableException when cancelSubscription returns false', async () => {
		policy.assertCanCancel.mockResolvedValue({
			guardianship: {
				id: guardianshipId,
				animalId,
				status: GuardianshipStatusEnum.ACTIVE,
				subscriptionId: 'sub-1'
			} as never,
			isAlreadyTerminal: false
		});
		paymentService.cancelSubscription.mockResolvedValue(false);

		await expect(handler.execute(new CancelGuardianshipCommand(guardianshipId, reason))).rejects.toThrow(
			PaymentServiceUnavailableException
		);
		expect(repository.cancel).not.toHaveBeenCalled();
	});

	it('cancels and publishes GuardianshipCancelledEvent when not isAlreadyTerminal', async () => {
		const guardianship = {
			id: guardianshipId,
			animalId,
			status: GuardianshipStatusEnum.ACTIVE,
			subscriptionId: 'sub-1'
		} as never;
		policy.assertCanCancel.mockResolvedValue({
			guardianship,
			isAlreadyTerminal: false
		});
		paymentService.cancelSubscription.mockResolvedValue(true);

		const result = await handler.execute(new CancelGuardianshipCommand(guardianshipId, reason));

		expect(policy.assertCanCancel).toHaveBeenCalledWith(guardianshipId);
		expect(paymentService.cancelSubscription).toHaveBeenCalledWith('sub-1');
		expect(repository.cancel).toHaveBeenCalledWith(guardianshipId, expect.any(Date));
		expect(eventBus.publish).toHaveBeenCalledWith(new GuardianshipCancelledEvent(guardianship, reason));
		expect(result).toEqual({ guardianshipId });
	});
});
