import { faker } from '@faker-js/faker';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService, PaymentWebhookEvent } from '@pif/payment';
import { GuardianshipStatusEnum, LedgerEntrySourceEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { RecordLedgerIncomeCommand } from '../../../finance/commands/record-ledger-income/record-ledger-income.command';
import { LedgerRepository } from '../../../finance/repositories/ledger.repository';
import { ProcessDonationWebhookSubscriptionCommand } from '../../../donations/commands/process-donation-webhook-subscription/process-donation-webhook-subscription.command';
import { GuardianshipActivatedEvent } from '../../events/guardianship-activated/guardianship-activated.event';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { ProcessPaymentWebhookCommand } from './process-payment-webhook.command';
import { ProcessPaymentWebhookHandler } from './process-payment-webhook.handler';

describe('ProcessPaymentWebhookHandler', () => {
	let handler: ProcessPaymentWebhookHandler;
	let repository: DeepMocked<GuardianshipRepository>;
	let ledgerRepository: DeepMocked<LedgerRepository>;
	let eventBus: DeepMocked<EventBus>;
	let commandBus: DeepMocked<CommandBus>;
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
		cancellationToken: null,
		paidPeriodEndAt: null as Date | null,
		guardianPrivilegesUntil: null as Date | null
	};
	const guardianship = baseGuardianship as never;

	const subscriptionSucceededPayload = {
		subscriptionId,
		event: PaymentWebhookEvent.SUBSCRIPTION_SUCCEEDED,
		providerPaymentId: 'mock-provider-payment-id',
		grossAmount: 10_000,
		feeAmount: 250,
		netAmount: 9_750,
		paidAt: new Date().toISOString()
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ProcessPaymentWebhookHandler,
				{ provide: GuardianshipRepository, useValue: createMock<GuardianshipRepository>() },
				{ provide: LedgerRepository, useValue: createMock<LedgerRepository>() },
				{ provide: CommandBus, useValue: createMock<CommandBus>() },
				{ provide: EventBus, useValue: createMock<EventBus>() },
				{ provide: Logger, useValue: createMock<Logger>() },
				{ provide: PaymentService, useValue: createMock<PaymentService>() }
			]
		}).compile();

		handler = module.get<ProcessPaymentWebhookHandler>(ProcessPaymentWebhookHandler);
		repository = module.get(GuardianshipRepository);
		ledgerRepository = module.get(LedgerRepository);
		commandBus = module.get(CommandBus);
		eventBus = module.get(EventBus);
		paymentService = module.get(PaymentService);

		ledgerRepository.findByProviderPaymentId.mockResolvedValue(undefined);
		const ledgerEntryId = faker.string.uuid();
		commandBus.execute.mockImplementation(async (cmd: unknown) => {
			if (cmd instanceof RecordLedgerIncomeCommand) {
				return { id: ledgerEntryId };
			}
			if (cmd instanceof ProcessDonationWebhookSubscriptionCommand) {
				return { handledBy: 'donation_subscription' } as never;
			}
			return undefined as never;
		});
	});

	it('routes to donation subscription handler when guardianship not found', async () => {
		repository.findBySubscriptionId.mockResolvedValue(undefined);

		await expect(handler.execute(new ProcessPaymentWebhookCommand(subscriptionSucceededPayload))).resolves.toEqual({
			handledBy: 'donation_subscription'
		});
	});

	it('returns activated: true and publishes GuardianshipActivatedEvent when subscription.succeeded and status was PENDING_PAYMENT', async () => {
		repository.findBySubscriptionId.mockResolvedValue(guardianship);
		repository.activateWithPaidPeriodEnd.mockResolvedValue(undefined);
		repository.findLedgerLabelsByGuardianshipId.mockResolvedValue({
			animalName: 'Барсик',
			guardianDisplayName: 'Иван'
		});

		const result = await handler.execute(new ProcessPaymentWebhookCommand(subscriptionSucceededPayload));

		const ledgerCall = commandBus.execute.mock.calls.find((c) => c[0] instanceof RecordLedgerIncomeCommand);
		expect(ledgerCall).toBeDefined();
		const ledgerCmd = ledgerCall![0] as RecordLedgerIncomeCommand;
		expect(ledgerCmd.payload).toMatchObject({
			source: LedgerEntrySourceEnum.GUARDIANSHIP,
			guardianshipId,
			grossAmount: subscriptionSucceededPayload.grossAmount,
			providerPaymentId: subscriptionSucceededPayload.providerPaymentId,
			donorDisplayName: 'Иван'
		});
		expect(ledgerCmd.payload.title).toContain('Барсик');

		expect(result).toMatchObject({ guardianshipId, activated: true, handledBy: 'guardianship' });
		expect(result.ledgerEntryId).toEqual(expect.any(String));
		expect(repository.activateWithPaidPeriodEnd).toHaveBeenCalledWith(guardianshipId, expect.any(Date));
		expect(eventBus.publish).toHaveBeenCalledWith(new GuardianshipActivatedEvent(guardianship));
	});

	it('returns activated: true and prolongs paid period when subscription.succeeded and status already ACTIVE', async () => {
		const activeGuardianship = {
			...baseGuardianship,
			status: GuardianshipStatusEnum.ACTIVE,
			paidPeriodEndAt: new Date('2030-01-01')
		} as never;
		repository.findBySubscriptionId.mockResolvedValue(activeGuardianship);
		repository.updatePaidPeriodEnd.mockResolvedValue(undefined);
		repository.findLedgerLabelsByGuardianshipId.mockResolvedValue({
			animalName: 'Мурка',
			guardianDisplayName: null
		});

		const result = await handler.execute(new ProcessPaymentWebhookCommand(subscriptionSucceededPayload));

		expect(result).toMatchObject({ guardianshipId, activated: true, handledBy: 'guardianship' });
		expect(result.ledgerEntryId).toEqual(expect.any(String));
		expect(repository.updatePaidPeriodEnd).toHaveBeenCalledWith(guardianshipId, expect.any(Date));
		expect(repository.activateWithPaidPeriodEnd).not.toHaveBeenCalled();
	});

	it('does not prolong guardianship when ledger already has providerPaymentId for this guardianship', async () => {
		const activeGuardianship = {
			...baseGuardianship,
			status: GuardianshipStatusEnum.ACTIVE,
			paidPeriodEndAt: new Date('2030-01-01')
		} as never;
		repository.findBySubscriptionId.mockResolvedValue(activeGuardianship);
		ledgerRepository.findByProviderPaymentId.mockResolvedValue({
			id: faker.string.uuid(),
			guardianshipId
		} as never);

		const result = await handler.execute(new ProcessPaymentWebhookCommand(subscriptionSucceededPayload));

		expect(result).toMatchObject({
			guardianshipId,
			activated: true,
			handledBy: 'guardianship'
		});
		expect(repository.updatePaidPeriodEnd).not.toHaveBeenCalled();
		expect(repository.activateWithPaidPeriodEnd).not.toHaveBeenCalled();
		const ledgerCalls = commandBus.execute.mock.calls.filter((c) => c[0] instanceof RecordLedgerIncomeCommand);
		expect(ledgerCalls).toHaveLength(0);
	});

	it('cancels and returns cancelled: true when subscription.failed and status was not CANCELLED', async () => {
		repository.findBySubscriptionId.mockResolvedValue(guardianship);
		paymentService.cancelSubscription.mockResolvedValue(true);
		repository.cancel.mockResolvedValue(undefined);
		commandBus.execute.mockResolvedValue(undefined);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand({
				subscriptionId,
				event: PaymentWebhookEvent.SUBSCRIPTION_FAILED
			})
		);

		expect(result).toEqual({ guardianshipId, cancelled: true, handledBy: 'guardianship' });
		expect(paymentService.cancelSubscription).toHaveBeenCalledWith(subscriptionId);
		expect(repository.cancel).toHaveBeenCalledWith(guardianshipId, expect.any(Date), null);
		expect(eventBus.publish).toHaveBeenCalledWith(
			new GuardianshipCancelledEvent(guardianship, false, 'Платёж не прошёл')
		);
	});

	it('returns cancelled: false when subscription.failed but status already CANCELLED (idempotent)', async () => {
		const cancelledGuardianship = { ...baseGuardianship, status: GuardianshipStatusEnum.CANCELLED } as never;
		repository.findBySubscriptionId.mockResolvedValue(cancelledGuardianship);
		commandBus.execute.mockResolvedValue(undefined);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand({
				subscriptionId,
				event: PaymentWebhookEvent.SUBSCRIPTION_FAILED
			})
		);

		expect(result).toEqual({ guardianshipId, cancelled: false, handledBy: 'guardianship' });
		expect(paymentService.cancelSubscription).not.toHaveBeenCalled();
		expect(repository.cancel).not.toHaveBeenCalled();
	});

	it('cancels and returns cancelled: true when subscription.canceled and status was not CANCELLED', async () => {
		repository.findBySubscriptionId.mockResolvedValue(guardianship);
		repository.cancel.mockResolvedValue(undefined);
		commandBus.execute.mockResolvedValue(undefined);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand({
				subscriptionId,
				event: PaymentWebhookEvent.SUBSCRIPTION_CANCELED
			})
		);

		expect(result).toEqual({ guardianshipId, cancelled: true, handledBy: 'guardianship' });
		expect(repository.cancel).toHaveBeenCalledWith(guardianshipId, expect.any(Date), null);
		expect(eventBus.publish).toHaveBeenCalledWith(
			new GuardianshipCancelledEvent(guardianship, false, 'Отмена в платежном сервисе вами или сервисом')
		);
	});

	it('returns cancelled: false when subscription.canceled but status already CANCELLED (idempotent)', async () => {
		const cancelledGuardianship = { ...baseGuardianship, status: GuardianshipStatusEnum.CANCELLED } as never;
		repository.findBySubscriptionId.mockResolvedValue(cancelledGuardianship);
		commandBus.execute.mockResolvedValue(undefined);

		const result = await handler.execute(
			new ProcessPaymentWebhookCommand({
				subscriptionId,
				event: PaymentWebhookEvent.SUBSCRIPTION_CANCELED
			})
		);

		expect(result).toEqual({ guardianshipId, cancelled: false, handledBy: 'guardianship' });
		expect(repository.cancel).not.toHaveBeenCalled();
	});
});
