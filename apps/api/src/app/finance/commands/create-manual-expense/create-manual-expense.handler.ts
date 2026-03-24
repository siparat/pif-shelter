import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { FileStoragePolicy } from '../../../core/policies/file-storage.policy';
import { ManualExpenseCreatedEvent } from '../../events/manual-expense-created/manual-expense-created.event';
import { AbstractLedgerRepository } from '../../repositories/abstract-ledger.repository';
import { CreateManualExpenseCommand } from './create-manual-expense.command';

@CommandHandler(CreateManualExpenseCommand)
export class CreateManualExpenseHandler implements ICommandHandler<CreateManualExpenseCommand> {
	constructor(
		private readonly repository: AbstractLedgerRepository,
		private readonly fileStoragePolicy: FileStoragePolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute({ dto, userId }: CreateManualExpenseCommand): Promise<{ id: string }> {
		await this.fileStoragePolicy.assertExists(dto.receiptStorageKey);

		const created = await this.repository.insertExpense({
			amount: dto.amount,
			occurredAt: new Date(dto.occurredAt),
			title: dto.title,
			note: dto.note,
			receiptStorageKey: dto.receiptStorageKey,
			createdByUserId: userId
		});

		this.eventBus.publish(new ManualExpenseCreatedEvent(created));
		this.logger.log('Ручной расход создан', { ledgerEntryId: created.id, userId });

		return { id: created.id };
	}
}
