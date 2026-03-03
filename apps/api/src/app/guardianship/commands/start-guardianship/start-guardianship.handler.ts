import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { GuardianshipCreatedEvent } from '../../events/guardianship-created/guardianship-created.event';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { StartGuardianshipCommand } from './start-guardianship.command';
import { StartGuardianshipPolicy } from './start-guardianship.policy';

@CommandHandler(StartGuardianshipCommand)
export class StartGuardianshipHandler implements ICommandHandler<StartGuardianshipCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly policy: StartGuardianshipPolicy,
		private readonly logger: Logger
	) {}

	async execute({
		animalId,
		userId
	}: StartGuardianshipCommand): Promise<{ guardianshipId: string; paymentUrl: string }> {
		const animal = await this.policy.assertCanStart(animalId);
		const amount = Number(animal.costOfGuardianship);

		const subscriptionId = randomUUID();
		const guardianship = await this.repository.createPending(userId, animalId, subscriptionId);
		const { url } = await this.paymentService.generatePaymentLink('subscription', subscriptionId, amount);

		this.eventBus.publish(new GuardianshipCreatedEvent(guardianship.animalId));
		this.logger.log('Опекунство создано, ожидает оплаты', {
			guardianshipId: guardianship.id,
			animalId,
			userId
		});

		return {
			guardianshipId: guardianship.id,
			paymentUrl: url
		};
	}
}
