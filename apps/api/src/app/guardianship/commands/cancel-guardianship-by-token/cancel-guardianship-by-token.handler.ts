import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PaymentService } from '@pif/payment';
import { GuardianshipStatusEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { GuardianshipCancelledEvent } from '../../events/guardianship-cancelled/guardianship-cancelled.event';
import { GuardianshipNotFoundByTokenException } from '../../exceptions/guardianship-not-found-by-token.exception';
import { PaymentServiceUnavailableException } from '../../exceptions/payment-service-unavailable.exception';
import { GuardianshipRepository } from '../../repositories/guardianship.repository';
import { resolveGuardianPrivilegesUntilForCancel } from '../../utils/resolve-guardian-privileges-until-for-cancel';
import { CancelGuardianshipPolicy } from '../cancel-guardianship/cancel-guardianship.policy';
import { CancelGuardianshipByTokenCommand } from './cancel-guardianship-by-token.command';

@CommandHandler(CancelGuardianshipByTokenCommand)
export class CancelGuardianshipByTokenHandler implements ICommandHandler<CancelGuardianshipByTokenCommand> {
	constructor(
		private readonly repository: GuardianshipRepository,
		private readonly paymentService: PaymentService,
		private readonly eventBus: EventBus,
		private readonly policy: CancelGuardianshipPolicy,
		private readonly logger: Logger
	) {}

	async execute({ token }: CancelGuardianshipByTokenCommand): Promise<{ guardianshipId: string }> {
		const guardianship = await this.repository.findByCancellationToken(token);
		if (!guardianship) {
			throw new GuardianshipNotFoundByTokenException();
		}

		const { isAlreadyTerminal } = await this.policy.assertCanCancel(guardianship.id);
		if (isAlreadyTerminal) {
			return { guardianshipId: guardianship.id };
		}

		const isSuccess = await this.paymentService.cancelSubscription(guardianship.subscriptionId);
		if (!isSuccess) {
			throw new PaymentServiceUnavailableException();
		}
		const guardianPrivilegesUntil = resolveGuardianPrivilegesUntilForCancel(guardianship, false);
		if (guardianPrivilegesUntil === null && guardianship.status === GuardianshipStatusEnum.ACTIVE) {
			this.logger.warn('Отмена по токену ACTIVE без paid_period_end_at — портальный доступ не продлён', {
				guardianshipId: guardianship.id
			});
		}
		await this.repository.cancel(guardianship.id, new Date(), guardianPrivilegesUntil);
		this.eventBus.publish(
			new GuardianshipCancelledEvent(guardianship, false, 'Пользователь отменил опекунство по ссылке из email')
		);
		this.logger.log('Опекунство отменено по токену', {
			guardianshipId: guardianship.id,
			animalId: guardianship.animalId
		});

		return { guardianshipId: guardianship.id };
	}
}
