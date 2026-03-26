import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from 'nestjs-pino';
import { LedgerIncomeRecordedEvent } from '../../events/ledger-income-recorded/ledger-income-recorded.event';
import { DuplicateProviderPaymentException } from '../../exceptions/duplicate-provider-payment.exception';
import { RecordLedgerIncomePolicy } from '../../policies/record-ledger-income.policy';
import { LedgerRepository } from '../../repositories/ledger.repository';
import { RecordLedgerIncomeCommand } from './record-ledger-income.command';

@CommandHandler(RecordLedgerIncomeCommand)
export class RecordLedgerIncomeHandler implements ICommandHandler<RecordLedgerIncomeCommand> {
	constructor(
		private readonly repository: LedgerRepository,
		private readonly policy: RecordLedgerIncomePolicy,
		private readonly eventBus: EventBus,
		private readonly logger: Logger
	) {}

	async execute(command: RecordLedgerIncomeCommand): Promise<{ id: string }> {
		const { payload } = command;
		this.policy.assertCanRecord(payload.grossAmount, payload.feeAmount, payload.netAmount);

		const existing = await this.repository.findByProviderPaymentId(payload.providerPaymentId);
		if (existing) {
			this.logger.warn('Дубликат providerPaymentId при записи дохода в ledger', {
				providerPaymentId: payload.providerPaymentId,
				ledgerEntryId: existing.id
			});
			throw new DuplicateProviderPaymentException(payload.providerPaymentId);
		}

		const created = await this.repository.insertIncome(payload);

		this.eventBus.publish(new LedgerIncomeRecordedEvent(created));
		this.logger.log('Доходная проводка записана в ledger', {
			ledgerEntryId: created.id,
			source: created.source,
			providerPaymentId: created.providerPaymentId
		});

		return { id: created.id };
	}
}
