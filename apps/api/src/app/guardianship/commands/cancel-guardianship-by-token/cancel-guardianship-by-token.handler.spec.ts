import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipNotFoundByTokenException } from '../../exceptions/guardianship-not-found-by-token.exception';
import { PaymentServiceUnavailableException } from '../../exceptions/payment-service-unavailable.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { CancelGuardianshipPolicy } from '../cancel-guardianship/cancel-guardianship.policy';
import { CancelGuardianshipByTokenCommand } from './cancel-guardianship-by-token.command';
import { CancelGuardianshipByTokenHandler } from './cancel-guardianship-by-token.handler';

describe('CancelGuardianshipByTokenHandler', () => {
	let handler: CancelGuardianshipByTokenHandler;
	let repository: DeepMocked<GuardianshipRepository>;
	let paymentService: DeepMocked<PaymentService>;
	let eventBus: DeepMocked<EventBus>;
	let policy: DeepMocked<CancelGuardianshipPolicy>;

	const token = faker.string.uuid();
	const guardianshipId = faker.string.uuid();
	const animalId = faker.string.uuid();
	const baseGuardianship = {
		id: guardianshipId,
		animalId,
		subscriptionId: 'sub-1',
		status: GuardianshipStatusEnum.PENDING_PAYMENT,
		guardianUserId: faker.string.uuid(),
		startedAt: new Date(),
		cancelledAt: null,
		cancellationToken: token
	};
	const guardianship = baseGuardianship as never;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CancelGuardianshipByTokenHandler,
				{ provide: GuardianshipRepository, useValue: createMock<GuardianshipRepository>() },
				{ provide: PaymentService, useValue: createMock<PaymentService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: CancelGuardianshipPolicy, useValue: createMock<CancelGuardianshipPolicy>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<CancelGuardianshipByTokenHandler>(CancelGuardianshipByTokenHandler);
		repository = module.get(GuardianshipRepository);
		paymentService = module.get(PaymentService);
		eventBus = module.get(EventBus);
		policy = module.get(CancelGuardianshipPolicy);
	});

	it('throws GuardianshipNotFoundByTokenException when guardianship not found by token', async () => {
		repository.findByCancellationToken.mockResolvedValue(undefined);

		await expect(handler.execute(new CancelGuardianshipByTokenCommand(token))).rejects.toThrow(
			GuardianshipNotFoundByTokenException
		);
		expect(policy.assertCanCancel).not.toHaveBeenCalled();
	});

	it('returns guardianshipId without cancelling when isAlreadyTerminal', async () => {
		repository.findByCancellationToken.mockResolvedValue(guardianship);
		policy.assertCanCancel.mockResolvedValue({
			guardianship: { ...baseGuardianship, status: GuardianshipStatusEnum.CANCELLED } as never,
			isAlreadyTerminal: true
		});

		const result = await handler.execute(new CancelGuardianshipByTokenCommand(token));

		expect(result).toEqual({ guardianshipId });
		expect(paymentService.cancelSubscription).not.toHaveBeenCalled();
		expect(repository.cancel).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('throws PaymentServiceUnavailableException when cancelSubscription returns false', async () => {
		repository.findByCancellationToken.mockResolvedValue(guardianship);
		policy.assertCanCancel.mockResolvedValue({ guardianship, isAlreadyTerminal: false });
		paymentService.cancelSubscription.mockResolvedValue(false);

		await expect(handler.execute(new CancelGuardianshipByTokenCommand(token))).rejects.toThrow(
			PaymentServiceUnavailableException
		);
		expect(repository.cancel).not.toHaveBeenCalled();
	});

	it('cancels and publishes event when not isAlreadyTerminal and cancelSubscription succeeds', async () => {
		repository.findByCancellationToken.mockResolvedValue(guardianship);
		policy.assertCanCancel.mockResolvedValue({ guardianship, isAlreadyTerminal: false });
		paymentService.cancelSubscription.mockResolvedValue(true);
		repository.cancel.mockResolvedValue(undefined);

		const result = await handler.execute(new CancelGuardianshipByTokenCommand(token));

		expect(result).toEqual({ guardianshipId });
		expect(policy.assertCanCancel).toHaveBeenCalledWith(guardianshipId);
		expect(paymentService.cancelSubscription).toHaveBeenCalledWith('sub-1');
		expect(repository.cancel).toHaveBeenCalledWith(guardianshipId, expect.any(Date));
		expect(eventBus.publish).toHaveBeenCalledWith(
			new GuardianshipCancelledEvent(guardianship, 'Пользователь отменил опекунство по ссылке из email')
		);
	});
});
