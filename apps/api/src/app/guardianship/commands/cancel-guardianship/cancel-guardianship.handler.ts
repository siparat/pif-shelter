import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { PaymentServiceUnavailableException } from '../../exceptions/payment-service-unavailable.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { resolveGuardianPrivilegesUntilForCancel } from '../../utils/resolve-guardian-privileges-until-for-cancel';
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

	async execute({
		guardianshipId,
		reason,
		isRefundExpected
	}: CancelGuardianshipCommand): Promise<{ guardianshipId: string }> {
		const { guardianship, isAlreadyTerminal } = await this.policy.assertCanCancel(guardianshipId);
		if (isAlreadyTerminal) {
			return { guardianshipId };
		}

		const isSuccess = await this.paymentService.cancelSubscription(guardianship.subscriptionId);
		if (!isSuccess) {
			throw new PaymentServiceUnavailableException();
		}
		const guardianPrivilegesUntil = resolveGuardianPrivilegesUntilForCancel(guardianship, isRefundExpected);
		if (
			guardianPrivilegesUntil === null &&
			!isRefundExpected &&
			guardianship.status === GuardianshipStatusEnum.ACTIVE
		) {
			this.logger.warn('Отмена ACTIVE без возврата без paid_period_end_at — портальный доступ не продлён', {
				guardianshipId
			});
		}
		await this.repository.cancel(guardianshipId, new Date(), guardianPrivilegesUntil);
		this.eventBus.publish(new GuardianshipCancelledEvent(guardianship, isRefundExpected, reason));
		this.logger.log('Опекунство отменено', { guardianshipId, animalId: guardianship.animalId });

		return { guardianshipId };
	}
}
