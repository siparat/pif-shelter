import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LedgerEntryDirectionEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { LedgerEntryNotFoundException } from '../../exceptions/ledger-entry-not-found.exception';
import { ManualExpenseDeletedEvent } from '../../events/manual-expense-deleted/manual-expense-deleted.event';
import { CanManageManualExpensePolicy } from '../../policies/can-manage-manual-expense.policy';
import { AbstractLedgerRepository } from '../../repositories/abstract-ledger.repository';
import { DeleteManualExpenseCommand } from './delete-manual-expense.command';

@CommandHandler(DeleteManualExpenseCommand)
export class DeleteManualExpenseHandler implements ICommandHandler<DeleteManualExpenseCommand> {
	constructor(
		private readonly repository: AbstractLedgerRepository,
		private readonly policy: CanManageManualExpensePolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ id, userId, userRole }: DeleteManualExpenseCommand): Promise<{ success: true }> {
		const existing = await this.repository.findByIdAndDirection(id, LedgerEntryDirectionEnum.EXPENSE);
		if (!existing) {
			throw new LedgerEntryNotFoundException(id);
		}

		this.policy.assertCanUpdateOrDelete(existing.createdByUserId, userId, userRole);
		const isDeleted = await this.repository.deleteExpense(id);
		if (!isDeleted) {
			return { success: true };
		}

		this.eventBus.publish(new ManualExpenseDeletedEvent(id));
		this.logger.log('Ручной расход удален', { ledgerEntryId: id, userId });

		return { success: true };
	}
}
