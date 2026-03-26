import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '@pif/payment';
import { DonationSubscriptionStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { DonationSubscriptionCancelledEvent } from '../../events/donation-subscription-cancelled/donation-subscription-cancelled.event';
import { DonationSubscriptionNotFoundByCancellationTokenException } from '../../exceptions/donation-subscription-not-found-by-cancellation-token.exception';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { CancelDonationSubscriptionByTokenCommand } from './cancel-donation-subscription-by-token.command';
import { CancelDonationSubscriptionByTokenHandler } from './cancel-donation-subscription-by-token.handler';

describe('CancelDonationSubscriptionByTokenHandler', () => {
	let handler: CancelDonationSubscriptionByTokenHandler;
	let repository: DeepMocked<DonationIntentsRepository>;
	let paymentService: DeepMocked<PaymentService>;
	let eventBus: DeepMocked<EventBus>;

	const token = faker.string.uuid();
	const subscriptionId = faker.string.uuid();
	const subscription = {
		id: faker.string.uuid(),
		subscriptionId,
		displayName: 'Test',
		hidePublicName: false,
		amountPerPeriod: 100,
		status: DonationSubscriptionStatusEnum.ACTIVE,
		cancelledAt: null,
		cancellationToken: token,
		createdAt: new Date(),
		updatedAt: new Date()
	} as any;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				CancelDonationSubscriptionByTokenHandler,
				{ provide: DonationIntentsRepository, useValue: createMock<DonationIntentsRepository>() },
				{ provide: PaymentService, useValue: createMock<PaymentService>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<CancelDonationSubscriptionByTokenHandler>(CancelDonationSubscriptionByTokenHandler);
		repository = module.get(DonationIntentsRepository);
		paymentService = module.get(PaymentService);
		eventBus = module.get(EventBus);
	});

	it('throws DonationSubscriptionNotFoundByCancellationTokenException when subscription not found', async () => {
		repository.findSubscriptionByCancellationToken.mockResolvedValue(undefined);

		await expect(handler.execute(new CancelDonationSubscriptionByTokenCommand(token))).rejects.toThrow(
			DonationSubscriptionNotFoundByCancellationTokenException
		);

		expect(paymentService.cancelSubscription).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('clears token and returns without cancelling when status is CANCELLED', async () => {
		repository.findSubscriptionByCancellationToken.mockResolvedValue({
			...subscription,
			status: DonationSubscriptionStatusEnum.CANCELLED
		});
		repository.clearSubscriptionCancellationToken.mockResolvedValue(subscription);

		const result = await handler.execute(new CancelDonationSubscriptionByTokenCommand(token));

		expect(result).toEqual({ subscriptionId });
		expect(paymentService.cancelSubscription).not.toHaveBeenCalled();
		expect(repository.clearSubscriptionCancellationToken).toHaveBeenCalledWith(subscription.id);
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('clears token and returns without cancelling when status is FAILED', async () => {
		repository.findSubscriptionByCancellationToken.mockResolvedValue({
			...subscription,
			status: DonationSubscriptionStatusEnum.FAILED
		});
		repository.clearSubscriptionCancellationToken.mockResolvedValue(subscription);

		const result = await handler.execute(new CancelDonationSubscriptionByTokenCommand(token));

		expect(result).toEqual({ subscriptionId });
		expect(paymentService.cancelSubscription).not.toHaveBeenCalled();
		expect(repository.clearSubscriptionCancellationToken).toHaveBeenCalledWith(subscription.id);
		expect(eventBus.publish).not.toHaveBeenCalled();
	});

	it('cancels and publishes event when status is not terminal', async () => {
		repository.findSubscriptionByCancellationToken.mockResolvedValue(subscription);
		paymentService.cancelSubscription.mockResolvedValue(true);
		repository.markSubscriptionCancelled.mockResolvedValue(subscription);

		const result = await handler.execute(new CancelDonationSubscriptionByTokenCommand(token));

		expect(result).toEqual({ subscriptionId });
		expect(paymentService.cancelSubscription).toHaveBeenCalledWith(subscriptionId);
		expect(repository.markSubscriptionCancelled).toHaveBeenCalledWith(subscription.id, expect.any(Date));
		expect(eventBus.publish).toHaveBeenCalledWith(new DonationSubscriptionCancelledEvent(subscription));
	});
});
