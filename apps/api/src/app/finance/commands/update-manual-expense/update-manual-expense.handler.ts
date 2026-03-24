import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { LedgerEntryDirectionEnum } from '@pif/shared';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { ManualExpenseUpdatedEvent } from '../../events/manual-expense-updated/manual-expense-updated.event';
import { LedgerEntryNotFoundException } from '../../exceptions/ledger-entry-not-found.exception';
import { CanManageManualExpensePolicy } from '../../policies/can-manage-manual-expense.policy';
import { AbstractLedgerRepository } from '../../repositories/abstract-ledger.repository';
import { UpdateManualExpenseCommand } from './update-manual-expense.command';

@CommandHandler(UpdateManualExpenseCommand)
export class UpdateManualExpenseHandler implements ICommandHandler<UpdateManualExpenseCommand> {
	constructor(
		private readonly repository: AbstractLedgerRepository,
		private readonly policy: CanManageManualExpensePolicy,
		private readonly fileStoragePolicy: FileStoragePolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto, userId, userRole }: UpdateManualExpenseCommand): Promise<{ id: string }> {
		const existing = await this.repository.findByIdAndDirection(dto.id, LedgerEntryDirectionEnum.EXPENSE);
		if (!existing) {
			throw new LedgerEntryNotFoundException(dto.id);
		}

		this.policy.assertCanUpdateOrDelete(existing.createdByUserId, userId, userRole);
		if (dto.receiptStorageKey) {
			await this.fileStoragePolicy.assertExists(dto.receiptStorageKey);
		}

		const updated = await this.repository.updateExpense({
			...dto,
			occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : undefined
		});

		if (!updated) {
			throw new LedgerEntryNotFoundException(dto.id);
		}

		this.eventBus.publish(new ManualExpenseUpdatedEvent(updated));
		this.logger.log('Ручной расход обновлен', { ledgerEntryId: updated.id, userId });

		return { id: updated.id };
	}
}
