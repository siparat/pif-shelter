import { Command } from '@nestjs/cqrs';
import { CreateManualExpenseRequestDto } from '@pif/contracts';

export class CreateManualExpenseCommand extends Command<{ id: string }> {
	constructor(
		public readonly dto: CreateManualExpenseRequestDto,
		public readonly userId: string
	) {
		super();
	}
}
