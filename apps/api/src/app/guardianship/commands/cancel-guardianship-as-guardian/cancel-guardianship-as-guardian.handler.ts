import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { PaymentServiceUnavailableException } from '../../exceptions/payment-service-unavailable.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { CancelGuardianshipAsGuardianCommand } from './cancel-guardianship-as-guardian.command';
import { CancelGuardianshipAsGuardianPolicy } from './cancel-guardianship-as-guardian.policy';

@CommandHandler(CancelGuardianshipAsGuardianCommand)
export class CancelGuardianshipAsGuardianHandler implements ICommandHandler<CancelGuardianshipAsGuardianCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly policy: CancelGuardianshipAsGuardianPolicy,
		private readonly logger: Logger
	) {}

	async execute({
		guardianshipId,
		guardianUserId
	}: CancelGuardianshipAsGuardianCommand): Promise<{ guardianshipId: string }> {
		const { guardianship, isAlreadyTerminal } = await this.policy.assertCanCancelAsGuardian(
			guardianshipId,
			guardianUserId
		);
		if (isAlreadyTerminal) {
			return { guardianshipId };
		}

		const isSuccess = await this.paymentService.cancelSubscription(guardianship.subscriptionId);
		if (!isSuccess) {
			throw new PaymentServiceUnavailableException();
		}
		await this.repository.cancel(guardianshipId, new Date());
		this.eventBus.publish(
			new GuardianshipCancelledEvent(guardianship, false, 'Опекун отменил опекунство через Telegram-бота')
		);
		this.logger.log('Опекунство отменено опекуном через бота', {
			guardianshipId,
			animalId: guardianship.animalId,
			guardianUserId
		});

		return { guardianshipId };
	}
}
