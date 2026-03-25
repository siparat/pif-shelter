import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { DonationOneTimeInitiatedEvent } from '../../events/donation-one-time-initiated.event';
import { AbstractDonationIntentsRepository } from '../../repositories/abstract-donation-intents.repository';
import { CreateDonationOneTimeCommand } from './create-donation-one-time.command';

@CommandHandler(CreateDonationOneTimeCommand)
export class CreateDonationOneTimeHandler implements ICommandHandler<CreateDonationOneTimeCommand> {
	constructor(
		private readonly repository: AbstractDonationIntentsRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto }: CreateDonationOneTimeCommand): Promise<{ paymentUrl: string; transactionId: string }> {
		const transactionId = randomUUID();
		const intent = await this.repository.createOneTimePending({
			transactionId,
			displayName: dto.displayName,
			hidePublicName: dto.hidePublicName,
			expectedAmount: dto.amount
		});
		const payment = await this.paymentService.generateDonationOneTimeLink({
			transactionId,
			amount: dto.amount
		});

		this.eventBus.publish(new DonationOneTimeInitiatedEvent(intent));
		this.logger.log('Создано намерение разового доната', {
			transactionId: intent.transactionId,
			intentId: intent.id
		});

		return { paymentUrl: payment.url, transactionId };
	}
}
