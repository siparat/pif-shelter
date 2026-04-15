import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentWebhookEvent } from '@pif/shared';
import { DonationSubscriptionStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { DonationSubscriptionCancelledEvent } from '../../events/donation-subscription-cancelled/donation-subscription-cancelled.event';
import { DonationIntentsRepository } from '../../repositories/donation-intents.repository';
import { ProcessDonationWebhookSubscriptionCommand } from './process-donation-webhook-subscription.command';
import { ProcessDonationWebhookSubscriptionHandler } from './process-donation-webhook-subscription.handler';

describe('ProcessDonationWebhookSubscriptionHandler', () => {
	let handler: ProcessDonationWebhookSubscriptionHandler;
	let repository: DeepMocked<DonationIntentsRepository>;
	let commandBus: DeepMocked<CommandBus>;
	let eventBus: DeepMocked<EventBus>;

	const subscriptionId = faker.string.uuid();
	const internalId = faker.string.uuid();
	const subscription = {
		id: internalId,
		subscriptionId,
		displayName: 'Test',
		hidePublicName: false,
		amountPerPeriod: 100,
		status: DonationSubscriptionStatusEnum.ACTIVE,
		cancelledAt: null,
		cancellationToken: null,
		createdAt: new Date(),
		updatedAt: new Date()
	} as any;

	const updated = {
		...subscription,
		status: DonationSubscriptionStatusEnum.CANCELLED,
		cancelledAt: new Date()
	} as any;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProcessDonationWebhookSubscriptionHandler,
				{ provide: DonationIntentsRepository, useValue: createMock<DonationIntentsRepository>() },
				{ provide: CommandBus, useValue: createMock<CommandBus>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() }
			]
		}).compile();

		handler = module.get<ProcessDonationWebhookSubscriptionHandler>(ProcessDonationWebhookSubscriptionHandler);
		repository = module.get(DonationIntentsRepository);
		commandBus = module.get(CommandBus);
		eventBus = module.get(EventBus);
	});

	it('marks subscription CANCELLED and publishes DonationSubscriptionCancelledEvent on subscription.canceled webhook', async () => {
		repository.findSubscriptionBySubscriptionId.mockResolvedValue(subscription);
		repository.markSubscriptionCancelled.mockResolvedValue(updated);

		const result = await handler.execute(
			new ProcessDonationWebhookSubscriptionCommand({
				subscriptionId,
				event: PaymentWebhookEvent.SUBSCRIPTION_CANCELED
			})
		);

		expect(repository.markSubscriptionCancelled).toHaveBeenCalledWith(internalId, expect.any(Date));
		expect(repository.updateSubscriptionStatus).not.toHaveBeenCalled();
		expect(commandBus.execute).not.toHaveBeenCalled();
		expect(eventBus.publish).toHaveBeenCalledWith(new DonationSubscriptionCancelledEvent(updated));
		expect(result).toEqual({ donationSubscriptionId: internalId, handledBy: 'donation_subscription' });
	});

	it('marks subscription FAILED on subscription.failed webhook', async () => {
		repository.findSubscriptionBySubscriptionId.mockResolvedValue(subscription);
		repository.updateSubscriptionStatus.mockResolvedValue({
			...subscription,
			status: DonationSubscriptionStatusEnum.FAILED
		} as any);

		const result = await handler.execute(
			new ProcessDonationWebhookSubscriptionCommand({
				subscriptionId,
				event: PaymentWebhookEvent.SUBSCRIPTION_FAILED
			})
		);

		expect(repository.updateSubscriptionStatus).toHaveBeenCalledWith(
			internalId,
			DonationSubscriptionStatusEnum.FAILED
		);
		expect(repository.markSubscriptionCancelled).not.toHaveBeenCalled();
		expect(eventBus.publish).not.toHaveBeenCalled();
		expect(result).toEqual({ donationSubscriptionId: internalId, handledBy: 'donation_subscription' });
	});
});
