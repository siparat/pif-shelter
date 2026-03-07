import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { PaymentServiceUnavailableException } from '../../exceptions/payment-service-unavailable.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { CancelGuardianshipCommand } from './cancel-guardianship.command';
import { CancelGuardianshipPolicy } from './cancel-guardianship.policy';

@CommandHandler(CancelGuardianshipCommand)
export class CancelGuardianshipHandler implements ICommandHandler<CancelGuardianshipCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly policy: CancelGuardianshipPolicy,
		private readonly logger: Logger
	) {}

	async execute({ guardianshipId, reason }: CancelGuardianshipCommand): Promise<{ guardianshipId: string }> {
		const { guardianship, isAlreadyTerminal } = await this.policy.assertCanCancel(guardianshipId);
		if (isAlreadyTerminal) {
			return { guardianshipId };
		}

		const isSuccess = await this.paymentService.cancelSubscription(guardianship.subscriptionId);
		if (!isSuccess) {
			throw new PaymentServiceUnavailableException();
		}
		await this.repository.cancel(guardianshipId, new Date());
		this.eventBus.publish(new GuardianshipCancelledEvent(guardianship, reason));
		this.logger.log('Опекунство отменено', { guardianshipId, animalId: guardianship.animalId });

		return { guardianshipId };
	}
}
