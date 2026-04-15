import { Command } from '@nestjs/cqrs';
import { CreateManualExpenseRequestDto } from '../../../core/dto';

export class CreateManualExpenseCommand extends Command<{ id: string }> {
	constructor(
		public readonly dto: CreateManualExpenseRequestDto,
		public readonly userId: string
	) {
		super();
	}
}
