import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService, PaymentWebhookEvent } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipActivatedEvent } from '../../events/guardianship-activated/guardianship-activated.event';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipNotFoundBySubscriptionException } from '../../exceptions/guardianship-not-found-by-subscription.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { ProcessPaymentWebhookCommand } from './process-payment-webhook.command';
import { ProcessPaymentWebhookHandler } from './process-payment-webhook.handler';

describe('ProcessPaymentWebhookHandler', () => {
	let handler: ProcessPaymentWebhookHandler;
	let repository: DeepMocked<GuardianshipRepository>;
	let eventBus: DeepMocked<EventBus>;
	let paymentService: DeepMocked<PaymentService>;

	const subscriptionId = faker.string.uuid();
	const guardianshipId = faker.string.uuid();
	const baseGuardianship = {
		id: guardianshipId,
		animalId: faker.string.uuid(),
		subscriptionId,
		status: GuardianshipStatusEnum.PENDING_PAYMENT,
		guardianUserId: faker.string.uuid(),
		startedAt: new Date(),
		cancelledAt: null,
		cancellationToken: null
	};
	const guardianship = baseGuardianship as never;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProcessPaymentWebhookHandler,
				{ provide: GuardianshipRepository, useValue: createMock<GuardianshipRepository>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() },
				{ provide: PaymentService, useValue: createMock<PaymentService>() }
			]
		}).compile();

		handler = module.get<ProcessPaymentWebhookHandler>(ProcessPaymentWebhookHandler);
		repository = module.get(GuardianshipRepository);
		eventBus = module.get(EventBus);
		paymentService = module.get(PaymentService);
	});

	it('throws GuardianshipNotFoundBySubscriptionException when guardianship not found', async () => {
		repository.findBySubscriptionId.mockResolvedValue(undefined);

		await expect(
			handler.execute(
				new ProcessPaymentWebhookCommand(subscriptionId, PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED)
			)
		).rejects.toThrow(GuardianshipNotFoundBySubscriptionException);
	});

	it('returns activated: true and publishes GuardianshipActivatedEvent when subscription.succeeded and status was PENDING_PAYMENT', async () => {
		repository.findBySubscriptionId.mockResolvedValue(guardianship);
		repository.activate.mockResolvedValue(undefined);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand(subscriptionId, PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED)
		);

		expect(result).toEqual({ guardianshipId, activated: true });
		expect(repository.activate).toHaveBeenCalledWith(guardianshipId);
		expect(eventBus.publish).toHaveBeenCalledWith(new GuardianshipActivatedEvent(guardianship));
	});

	it('returns activated: false when subscription.succeeded but status already ACTIVE (idempotent)', async () => {
		const activeGuardianship = { ...baseGuardianship, status: GuardianshipStatusEnum.ACTIVE } as never;
		repository.findBySubscriptionId.mockResolvedValue(activeGuardianship);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand(subscriptionId, PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED)
		);

		expect(result).toEqual({ guardianshipId, activated: false });
		expect(repository.activate).not.toHaveBeenCalled();
	});

	it('cancels and returns cancelled: true when subscription.failed and status was not CANCELLED', async () => {
		repository.findBySubscriptionId.mockResolvedValue(guardianship);
		paymentService.cancelSubscription.mockResolvedValue(true);
		repository.cancel.mockResolvedValue(undefined);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand(subscriptionId, PaymentWebhookEvent.SUBSCRIPTION_FAILED)
		);

		expect(result).toEqual({ guardianshipId, cancelled: true });
		expect(paymentService.cancelSubscription).toHaveBeenCalledWith(subscriptionId);
		expect(repository.cancel).toHaveBeenCalledWith(guardianshipId, expect.any(Date));
		expect(eventBus.publish).toHaveBeenCalledWith(new GuardianshipCancelledEvent(guardianship, 'Платёж не прошёл'));
	});

	it('returns cancelled: false when subscription.failed but status already CANCELLED (idempotent)', async () => {
		const cancelledGuardianship = { ...baseGuardianship, status: GuardianshipStatusEnum.CANCELLED } as never;
		repository.findBySubscriptionId.mockResolvedValue(cancelledGuardianship);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand(subscriptionId, PaymentWebhookEvent.SUBSCRIPTION_FAILED)
		);

		expect(result).toEqual({ guardianshipId, cancelled: false });
		expect(paymentService.cancelSubscription).not.toHaveBeenCalled();
		expect(repository.cancel).not.toHaveBeenCalled();
	});

	it('cancels and returns cancelled: true when subscription.canceled and status was not CANCELLED', async () => {
		repository.findBySubscriptionId.mockResolvedValue(guardianship);
		repository.cancel.mockResolvedValue(undefined);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand(subscriptionId, PaymentWebhookEvent.SUBSCRIPTION_CANCELED)
		);

		expect(result).toEqual({ guardianshipId, cancelled: true });
		expect(repository.cancel).toHaveBeenCalledWith(guardianshipId, expect.any(Date));
		expect(eventBus.publish).toHaveBeenCalledWith(
			new GuardianshipCancelledEvent(guardianship, 'Отмена в платежном сервисе вами или сервисом')
		);
	});

	it('returns cancelled: false when subscription.canceled but status already CANCELLED (idempotent)', async () => {
		const cancelledGuardianship = { ...baseGuardianship, status: GuardianshipStatusEnum.CANCELLED } as never;
		repository.findBySubscriptionId.mockResolvedValue(cancelledGuardianship);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand(subscriptionId, PaymentWebhookEvent.SUBSCRIPTION_CANCELED)
		);

		expect(result).toEqual({ guardianshipId, cancelled: false });
		expect(repository.cancel).not.toHaveBeenCalled();
	});
});
