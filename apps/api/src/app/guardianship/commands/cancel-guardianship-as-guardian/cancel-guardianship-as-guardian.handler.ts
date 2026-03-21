import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { PaymentServiceUnavailableException } from '../../exceptions/payment-service-unavailable.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { resolveGuardianPrivilegesUntilForCancel } from '../../utils/resolve-guardian-privileges-until-for-cancel';
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
		const guardianPrivilegesUntil = resolveGuardianPrivilegesUntilForCancel(guardianship, false);
		if (guardianPrivilegesUntil === null && guardianship.status === GuardianshipStatusEnum.ACTIVE) {
			this.logger.warn('Отмена опекуном ACTIVE без paid_period_end_at — портальный доступ не продлён', {
				guardianshipId
			});
		}
		await this.repository.cancel(guardianshipId, new Date(), guardianPrivilegesUntil);
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
